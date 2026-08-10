# Canvas write-back: what is possible, what is not, and the path that works

Written 2026-08-10 from the labnode session, for whoever is working this in VS Code.
Every claim below was tested live against `brophyprep.instructure.com` with Jared's
teacher token, not inferred from docs. HTTP codes are real responses.

## The short version

**A browser cannot PUT to Canvas from this app. Not with a workaround, not with a
different fetch config.** Three independent blockers, any one of which is fatal:

| blocker | test | result |
|---|---|---|
| No CORS on the Canvas API | `OPTIONS /api/v1/users/self` with `Origin: https://test.aaand.space` | **HTTP 404**, zero `access-control-*` headers |
| Teacher token cannot act as a student | `GET /users/self?as_user_id=<student>` | **HTTP 401** |
| No admin, so no LTI developer key | `GET /accounts` → `[]`, `GET /accounts/1/developer_keys` | **HTTP 403** |

The CORS one alone ends the browser-direct idea. Even if it were open, putting a
Canvas token in client-side JavaScript hands every student a credential that can
rewrite the gradebook for all 125 students across five courses.

## What the teacher token CAN do

Verified this session, repeatedly, on live courses:

```
PUT /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
    submission[posted_grade]=<points>
    comment[text_comment]=<text>
→ HTTP 200
```

So the write that matters is available. It just has to happen **server-side**.

## The architecture that works

```
browser (student)            server (holds the token)          Canvas
─────────────────            ────────────────────────          ──────
save portfolio entry  ──▶    Firebase Cloud Function     ──▶   PUT .../submissions/:user_id
  to Firestore               reads Firestore,                   grade + comment carrying
                             maps student → Canvas user id,     the portfolio URL
                             holds CANVAS_API_TOKEN in
                             functions config, never in
                             client code
```

**This is a pattern Jared has already shipped.** BreakFree runs Claude Haiku through
a Firebase proxy for exactly this reason: keep the credential server-side, let the
static front end talk only to the function. Reuse that shape rather than inventing one.

### The one hard part: identity mapping

Canvas needs `user_id`. Firebase Auth gives you a UID and an email. The join key is
the school email, and it is reliable: every student in all five courses is
`<initial><lastname><gradyear>@brophybroncos.org`.

A roster with Canvas user IDs, emails, course and section for all 125 students
already exists and is current as of 2026-08-10:
`https://docs.google.com/spreadsheets/d/18V-mVi7IQH9AR2PPTupdmdLGYtnYm8MgRQ8UpSvPpnw`

Pull it once into a Firestore collection keyed by email. Do not try to resolve
identity per request against the Canvas API; it is slow and it burns rate limit.

**Refuse to write if the email does not resolve.** A silent fallback that guesses a
user ID will post a student's work onto another student's submission.

### Which assignment

Do not hard-code an assignment ID in the app. The Working Artist Portfolio
assignment already exists in Art & Technology (Canvas course `5067`, assignment
`138947`), but IDs move between terms and that one has already been repinned once
today. Put the mapping in Firestore or in function config so it changes without a
deploy.

## Two things to decide before building

1. **Is this a submission or a grade?** They are different Canvas operations. A
   teacher token can post a *grade and a comment* on a student's submission, but it
   **cannot create the submission itself** on the student's behalf, because that
   needs masquerade, which returned 401. If the requirement is genuinely "the
   student's work appears as a Canvas submission," the student still has to submit
   in Canvas, and the honest design is: the app hosts the work and the student pastes
   the URL into a Canvas URL-submission. The function then adds the grade and comment.

2. **Do you want the sanctioned path instead?** LTI 1.3 with Assignment and Grade
   Services is the real answer to "the app writes to Canvas," and it is what this app
   would use if it outlived the classroom. It needs a developer key from a Canvas
   admin, which Jared does not have (403 above). That is an IT ask, not a code
   change. Worth starting in parallel if this is going to matter past this term.

## What not to do

- Do not put `CANVAS_API_TOKEN` in `firebase-config.js`, in any `.js` the browser
  loads, or in a Firestore document. It is a full-privilege teacher credential.
- Do not proxy raw Canvas API calls through a function. Expose one narrow endpoint
  that takes a portfolio entry and posts a grade plus a comment. A general proxy is
  the same credential leak with extra steps.
- Do not write to Canvas on every keystroke or autosave. Canvas rate-limits, and a
  gradebook that churns is worse than one that updates on submit.

## Working reference code

The labnode repo `~/projects/canvas-integration` has the proven write path in
`canvas/post-grades.js`, including the exact payload shape, the points-not-percent
rule, and the batch validation. Read that before writing new Canvas code. Note in
particular that assignments carry `post_to_sis: true`, which makes Canvas reject a
blank `due_at`; that cost real debugging time today.

---

# The stack, decided 2026-08-10

Jared's requirement, verbatim: *"a student posts to the app and that is relatively
immediately documented as a portfolio grade in canvas. That is the only way to
ensure it is a tool that is being used rather than only being recommended."*

**This requirement is easier than the one above, and it dissolves the hard part.**
He wants a *grade*, not a *submission*. Grading is exactly what a teacher token can
do. Masquerade, LTI, developer keys, admin: all of it drops out of scope.

## The shape

**One Canvas assignment. One grade. Updated in place on every post.**

Not one Canvas assignment per portfolio entry. That produces gradebook churn and
125 students' worth of noise, and it makes the gradebook a log instead of a signal.
Instead the Working Artist Portfolio assignment holds a single running score that
answers one question at a glance: *is this student actually using the thing.*

```
entries in Firestore   →   score posted
        0                     none (Canvas shows missing at 50%, which is the nudge)
        1                     60%   "you started"
        3                     85%   "this is a practice"
        5+                    100%  "this is a habit"
```

Thresholds are Jared's call; the mechanism is the point. Every post recomputes and
re-PUTs one number. The submission comment carries the permalink to the newest
entry, so SpeedGrader becomes a click-through to the actual work.

## The parts

| layer | what | change needed |
|---|---|---|
| Front door | Firebase Hosting, static | **none** |
| Data | Firestore `posts`, `users` | **none** |
| Media | Firebase Storage | **none** |
| **Bridge** | **one Cloud Function, Firestore `onDocumentCreated('posts/{id}')`** | **new, ~80 lines** |
| Identity | new Firestore `roster` collection, seeded once | new, one-time import |
| Canvas | `PUT /courses/:c/assignments/:a/submissions/:u` | verified working, HTTP 200 |

Everything except the bridge already exists. That is the whole build.

## The bridge, concretely

On `posts/{id}` create:
1. Read `posts[id].authorEmail` (or resolve the author UID through `users`).
2. Look up `roster/{email}` → `{ canvas_user_id, course_id, assignment_id }`.
   **If it misses, write a `canvas_sync_errors` doc and stop.** Never guess a user
   id; a wrong guess posts one student's work onto another student's grade.
3. Count that author's posts.
4. `PUT` the mapped score plus a comment carrying the entry title and permalink.
5. Write the Canvas response back onto the post (`canvasSyncedAt`, `canvasScore`)
   so the app can show the student their own grade landed. That closes the loop
   visibly, which is most of why the tool gets used.

Token lives in Functions config (`CANVAS_API_TOKEN`), never in client code, never
in Firestore.

## Seeding the roster

All 125 students with Canvas user ids, emails, course and section, current as of
2026-08-10:
`https://docs.google.com/spreadsheets/d/18V-mVi7IQH9AR2PPTupdmdLGYtnYm8MgRQ8UpSvPpnw`

Export to CSV, import once with the Admin SDK, keyed by lowercase email. Re-run at
term boundaries; Canvas user ids are stable within a term but course and assignment
ids are not.

## If Cloud Functions are not available

Firestore triggers need the Blaze plan. If billing is a blocker, the fallback keeps
every other part identical: the always-on Mac mini polls Firestore on a five-minute
launchd timer with a service account and posts the same grade through
`~/projects/canvas-integration`, which already has the working Canvas write path.
Slower and one more moving part, but zero new hosting and the token stays where it
already lives.

Prefer the Cloud Function. Event-driven, self-contained, and the app owns its own
write-back instead of depending on another machine being awake.

## Gotchas that will cost time if ignored

- **Points, not percent.** `posted_grade` is sent verbatim. On a 10-point assignment,
  85% is `8.5`. Sending `85` posts 85 out of 10.
- **`post_to_sis: true`** on these assignments makes Canvas reject a blank `due_at`.
  Do not clear dates from a script.
- **The 50% missing deduction is deliberate policy.** Do not disable it, and do not
  treat an existing 50 as a bug. It is the nudge that makes a student notice.
- **Rate limit.** Debounce. One PUT per post, never per keystroke or autosave.
- **Canvas assignment ids move.** Keep them in `roster`/config, never hard-coded.

---

# Revision: iterative cadence, decided 2026-08-10

Jared: *"How will that work when we need to track submissions iteratively? We need
daily/weekly postings to the portfolio?"*

Correct objection. **A single lifetime counter cannot see a missed week.** It gives
full marks to a student who posts five entries in September and then disappears.
The unit has to change, and one number cannot carry both things being measured.

## Separate the two measurements

They have opposite shapes, and conflating them is what makes portfolio grading
collapse into either busywork or vibes.

| | cadence | body of work |
|---|---|---|
| question | did you post this period | is any of it good |
| grader | the function, perfectly | Jared, only |
| shape | nearly binary | judged |
| when | every period | at milestones |
| points | small, many | large, few |

## Structure

**One `Portfolio` assignment per period, generated across the term**, each dated to
a real class meeting. The function scores each from entries whose **server
timestamp** falls inside that window.

Every course runs **45 meetings across 20 instructional weeks**, Aug 6 to Dec 18.
So weekly is 20 rows at 5 points (100 points of cadence), biweekly is 10 rows if
that reads lighter. Then one or two human-graded portfolio reviews at existing
milestones carry the real weight. 3D2 already has those milestones built: First
Light, Mid-Term Showing, FAE.

## Three properties worth building for

1. **The 20 assignments are generated, not authored.** `~/projects/canvas-integration`
   emits them from `schedule.json` in one pass, dated to real meeting days. This is
   the same mechanism that repinned 26 3D1 assignments on 2026-08-10. Cost is a
   script run.

2. **A missed week needs no teacher action.** The assignment comes due, nobody
   submitted, and the 50% missing deduction fires on its own. That policy is already
   enabled on all five courses and is deliberate (see
   `feedback_missing_deduction_stays_on`). It becomes the weekly accountability
   engine for free.

3. **Window membership goes by entry `createdAt`, server-side, not by sync time.**
   A student cannot backfill four posts in December and retroactively earn
   September. That property *is* the accountability.

## The one open policy question

Property 3 collides with the standing rule that there is no penalty for late work.
Reading offered, Jared decides: that rule protects **work**, and cadence is not
work, it is attendance to a practice. A missed week stays missed. If he overrules
it, the function re-scores past windows on backfill and the mechanism weakens
accordingly.

## What changes in the function

Barely anything. Same trigger, same identity lookup, same PUT.

```
on posts/{id} create:
  entry   = posts[id]                      // createdAt is server timestamp
  window  = periodContaining(entry.createdAt)   // from a periods collection
  target  = roster[email].assignments[window.id]
  count   = posts where author == entry.author and createdAt in window
  PUT score = scoreFor(count) to target
```

The `periods` collection is seeded from the same generation pass that creates the
Canvas assignments, so window boundaries and assignment ids arrive together and
cannot drift apart.

---

# Correction: there is no qualitative grade, 2026-08-10

Jared: *"Qualitative analysis for me is never grading. Qualitative feedback happens
in crits and is completely disconnected from quantitative evaluation of a student.
My rule is quality feedback happens in conversation. That never gets truncated to a
quantity."*

**The cadence-versus-quality split above is wrong and is superseded by this
section.** The real axis is **verifiable versus conversational**.

Points attach only to what can be checked without judgment:

- it exists
- it arrived inside the window
- it has the required parts
- you were in the room for crit
- you could answer for it when asked

Everything requiring judgment lives in conversation and is never compressed to a
number. So **the "human-graded portfolio review at milestones" proposed earlier
does not exist.** A milestone is still completion: did you install for the showing,
yes or no. The crit at that showing is the conversation, and it carries no score.

This is already stated in Jared's own grading doc, which reads *"Grades are
supportive, not evaluative. The commentary does the teaching."* It was there before
this conversation.

## Hard rules for this app

1. **Never score quality.** No rubric scoring, no AI evaluation of student work, no
   quality signal surfaced to the student as a number, a rank, or a badge.
2. **The automated comment is a receipt, not a judgment.** This is the live trap:
   the natural thing for a bot comment to say is "Nice work," and a machine
   congratulating a student on work it cannot see is precisely the truncation being
   refused. Post the record and nothing else:

   > `Entry 3, week of Sep 8. <permalink>`

3. **Written teaching is not ranking, and the distinction matters.** A comment from
   Jared can be specific and instructional; that is the commentary doing the
   teaching. What never happens is compressing the work to a merit number. The
   function does neither. It records.

## Where the app actually helps quality

Upstream of the gradebook entirely. It puts the work on a screen so crit has
something to look at, and it can record *that* a crit happened without touching
*what was said*. Attendance to the conversation is verifiable. The content of the
conversation stays out of Canvas.
