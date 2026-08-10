# Canvas write-back

Design record and the tested Canvas constraints: [`../CANVAS_WRITEBACK.md`](../CANVAS_WRITEBACK.md).

## The rule this code exists to hold

Two channels, decoupled by construction:

- **score** runs on mechanical checks only. Does it exist, did it arrive in the window, does it have the parts. No judgment reaches it.
- **commentary** can carry real analysis, and should when a model has actually read the entry. It may never carry a number, rank, letter or verdict. `canvas.js` enforces this at the write, not by convention: `assertNoVerdict` throws rather than post.

## Deploy

```bash
cd functions && npm install
firebase functions:secrets:set CANVAS_API_TOKEN     # teacher token, server-side only
firebase deploy --only functions
```

Firestore triggers need the Blaze plan. If billing blocks it, the fallback in the design record keeps every other part identical and polls from the always-on mini instead.

## One-time setup, in order

```bash
# 1. periods + the matching Canvas assignments, generated together so they cannot drift
CANVAS_API_TOKEN=... CANVAS_COURSE_ID=5067 \
  node scripts/canvas-generate-periods.mjs art-and-technology --weeks 1 --points 5 --dry
#    drop --dry when the window boundaries look right

# 2. push the generated periods into Firestore
node scripts/seed-periods.mjs art-and-technology

# 3. roster, keyed by lowercase school email
CANVAS_API_TOKEN=... GOOGLE_APPLICATION_CREDENTIALS=sa.json \
  node scripts/seed-roster.mjs --dry
```

Assignments are created **unpublished**. Publishing is by hand, week of, deliberately.

## Firestore shapes

```
roster/{email}    canvasUserId, canvasCourseId, courseSlug, name, section, period
periods/{id}      courseSlug, canvasCourseId, canvasAssignmentId, startsAt, endsAt,
                  label, pointsPossible, thresholds?
posts/{id}        userId, type, title, body, images[], createdAt   (written by the app)
                  + canvasSyncedAt, canvasScore, canvasPeriod, canvasEntryIndex
canvas_sync_errors/{id}   postId, reason, detail, userId, at
```

Watch `canvas_sync_errors`. It fills on identity misses, which are the failure that
matters: a student whose email is not in the roster is silently ungraded, and the
function refuses rather than guessing because a wrong guess posts one student's work
onto another student's grade.

## Gotchas that already cost time

- **Points, not percent.** `posted_grade` is verbatim. 85% of 5 points is `4.25`.
- **`post_to_sis: true`** makes Canvas reject a blank `due_at`. Never clear dates from a script.
- **The 50% missing deduction is deliberate policy.** Do not disable it. A period with no post auto-scores 50%, and that is the accountability working without teacher action.
- **Window membership is by the entry's server timestamp**, so a backfill cannot retroactively earn an earlier period.
