# INTERLOCKS.md

App side to Canvas side. Written 2026-08-10 from the MacBook VS Code session,
for the labnode session that owns the write-back.

`CANVAS_WRITEBACK.md` is the design record for the bridge and nothing here
redesigns it. This file covers the seam: what the app now guarantees, what it
still does not, and the things on this side that can break your Function.

Direction of travel is one way. If you need something changed on the app side,
add it to the requests section at the bottom and I will pick it up.

## Findings from the audit that touch your work

Full report is the audit artifact; these are the four that matter to the bridge.

### 1. Any student could post as another student

The rule for creating a post was `allow create: if isSignedIn()`. Nothing checked
that the `userId` on the new document belonged to the caller. Both rules files
had this, main and studio-log-redesign.

Today that is defacement. Under your trigger it is grade forgery: a signed-in
student writes a post carrying a classmate's `userId` and moves that classmate's
score. It also runs the other way, since a student can inflate their own entry
count by writing to the API directly instead of through the editor.

Your identity handling is careful in exactly the right place, refusing rather
than guessing when an email does not resolve. That care is defeated upstream if
the post itself arrives with an attacker-chosen owner. Fixed in this commit.

### 2. `createdAt` was client-supplied

Your property 3 is that window membership goes by entry `createdAt` so a student
cannot backfill September in December. That property did not hold, because
nothing stopped a client writing whatever timestamp it liked.

Rules now require `request.resource.data.createdAt == request.time` on create.
The editor already used `serverTimestamp()`, which resolves to exactly that, so
no app change was needed beyond the rule.

### 3. Posts had no email, and most profiles had none either

Step 1 of your bridge reads `posts[id].authorEmail` or resolves the author
through `users`. Neither existed reliably. Post documents carried only `userId`,
and 27 of 83 user documents had an `email` field at all. For most students the
lookup would have had nothing to resolve against, so the bridge would have
refused constantly and correctly.

Posts now carry `authorEmail`, lowercased at write time. Every profile created
from now on carries a lowercase school email from first sign-in.

### 4. Your error path would have failed silently

`error-reporting.js` has been writing to a `client_errors` collection since
February. No rule covered it, so the deny-all fallback rejected every write. The
module built to catch silent failures has been failing silently for six months,
because a failed error report has nowhere to report to.

`canvas_sync_errors` was set up to repeat this exactly. It appeared in no rules
file, so the write you make when an identity does not resolve would have been
denied and the refusal would have left no trace. That is the one place where
failing loudly matters most.

Rules now exist for `roster`, `periods`, `canvas_sync_errors` and
`client_errors`.

## What you can rely on once this is deployed

- `posts.userId` equals the authenticated uid. Enforced on create, and cannot be
  reassigned on update.
- `posts.createdAt` is the server's time. A client cannot choose its window.
- `posts.authorEmail` is present and lowercase on anything written by the
  current editor.
- `roster`, `periods` and `canvas_sync_errors` are readable per the table below
  and closed to client writes. The Admin SDK bypasses rules, so your Function
  and your seed script are unaffected by `allow write: if false`.
- Every new profile has a lowercase school email and a username.

| collection | client read | client write |
|---|---|---|
| `roster` | admin only | none |
| `periods` | signed in | none |
| `canvas_sync_errors` | admin only | none |
| `client_errors` | admin only | create only |

## What is still not true

Read this section before seeding anything.

- **None of it is deployed.** The rules compile and pass `firebase deploy
  --only firestore:rules --dry-run`, but nothing is live. Deployment is gated on
  the archive and the wipe, because deploying rules touches both classes at once.
- **Existing data predates all of it.** The 83 user documents and 262 posts on
  the project now have no `authorEmail` and mostly no `email`. Do not seed the
  roster against current data and do not test the bridge against it. It is going
  away in the wipe.
- **No rules unit tests ran.** The suite would need the Firestore emulator and
  this machine has no Java runtime. The rule changes are verified only by
  compilation and by reading. Someone should run a real test pass on a machine
  with Java before this protects a live gradebook.
- **`users` is still readable by any signed-in user.** That closes anonymous
  enumeration of 100 minors' emails and student IDs, which was the critical
  problem, but a classmate can still read another student's record. Closing that
  means moving `email` and `studentId` into a private subcollection, which the
  v2 tool would need updating for. Not done, deliberately, rather than done
  badly.

## Hazards on this side that will cost you time

**Bulk writes fire your trigger.** `onDocumentCreated('posts/{id}')` cannot tell
a migration from a student. The wipe, any re-import, and any backfill all touch
`posts` in bulk. With the bridge live, one re-import posts hundreds of grades
across five courses and a gradebook has no undo. We need an agreed stop
procedure before the trigger is enabled, written into the wipe runbook rather
than remembered in the moment.

**Stale clients will not send `authorEmail`.** Hosting served JS with a seven day
max-age and no fingerprinting, which is why the history is full of cache-bust
commits. This commit changes that to `must-revalidate`, but students can still
run the old editor for a while after deploy. Handle a missing `authorEmail` by
falling back to `users/{post.userId}.email` rather than refusing. That is a
second deterministic read, not a guess, so it does not weaken the identity rule.

**`firebase.json` now targets both Hosting sites explicitly.** A bare `firebase
deploy` will touch both. Use `--only hosting:portfolio-web-app-26` or
`--only hosting:portfolio-v2-log`.

**The functions block is deliberately absent from main.** `functions/` lives on
studio-log-redesign and is your lane, so main does not reference it. Add the
block when you bring `functions/` over, otherwise a full deploy fails on a
missing source directory.

**There are two admin mechanisms and both are live.** v1 code reads
`/admins/{uid}`, v2 code reads `users.role`. The unified `isAdmin()` accepts
either. Do not consolidate one away without checking both tools.

## Requests

1. **Confirm the write-back field names.** I have reserved `canvasSyncedAt`,
   `canvasScore` and `canvasAssignmentId` on `posts` and blocked clients from
   writing them, so a student cannot forge a sync record. If your Function uses
   different names, those names are client-writable and that is a hole. Tell me
   the real list and I will match the rule to it.

2. **Rules and config ownership.** `firestore.rules`, `storage.rules` and
   `firebase.json` are needed by both lanes and assigned to neither in
   CLAUDE.md. They are also the files most able to break the other class.
   Proposal: this lane owns all three, and you request a collection or a config
   block by adding it to this file. One writer, no collisions. Say so here if
   you would rather own them.

3. **Course to tool mapping.** The roster covers 125 students across five
   courses and there are two tools. I need to know which courses use v1 and
   which use Studio Log v2 before the class field can be enforced in rules.

4. **Tell me when the trigger goes live.** The wipe has to happen before it, or
   with it disabled.
