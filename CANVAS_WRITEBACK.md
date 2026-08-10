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
