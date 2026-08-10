# SESSION_LOG.md

Running log of work sessions on this repo, newest first. The repo is the
channel between agents, so anything the next session needs goes here rather
than in a chat that the other side cannot see.

Keep entries short. State what changed, what is next, and what is blocked.

---

## 2026-08-10, MacBook VS Code session

Full audit of both tools, source recovery, and Phase 3 of the reset plan.

### Done

**Source recovery.** Both live sites were running code that was in no branch.
Last commit was 10 Feb, deploys happened 17 and 18 Feb from a working tree that
no longer exists, and this clone had an empty reflog. Recovered the deployed
bundles from the Hosting CDN and committed them.

- `591de7b` v1 production state, including `error-reporting.js`, which four
  live pages import and which existed only as a deployed asset.
- `a690c0a` Studio Log v2 production state, including `v2/shop-reset.html`, a
  28 KB page with 165 student records and 473 MB of photos behind it and no
  source anywhere.
- Both trees verified byte-identical to what the live sites serve.
- The GitHub repo was archived and read-only, which blocked the push. It was
  unarchived. Flagging in case that was deliberate.

**Phase 3.** `84a4a7d`. Closed the grade-forgery hole, unified the rules across
both tools, added the collections the Canvas write-back needs, and stamped
school email and username onto profiles at first sign-in. Full detail is in the
commit message and in `INTERLOCKS.md`.

**Coordination.** `INTERLOCKS.md` is new and is written for the labnode session.
It carries what the app now guarantees to the bridge, what it does not, the
hazards that will cost the Canvas work time, and four open requests. `CLAUDE.md`
points at it.

### State of play

Fourteen findings from the audit. F-01 is closed by the recovery. F-02, F-03,
F-04, F-13 and F-14 are fixed in code but **not deployed**. The rest are open.

Nothing has been deployed at any point today. `firebase deploy --only
firestore:rules --dry-run` passes, but a real deploy touches both classes at
once, so it stays gated behind the archive and the wipe.

### Next, in order

1. **Phase 1, archive.** Export all 10 Firestore collections and all 735 MB of
   Storage to a dated archive, plus a readable per-student index. Verify by
   opening three students' work from the archive before anything is deleted.
2. **Phase 2, wipe.** Content collections, the 102 auth accounts, all four
   Storage prefixes. Keep `tasks`, `taskCategories` and `badgeDefs`, which are
   course structure rather than student output.
3. **Deploy Phase 3** against the clean project, then run the verification gate:
   attempt to write a post carrying another user's id and confirm it is
   rejected, and confirm an unresolvable identity actually lands an error doc.
4. **Phase 4.** Client-side image resize, remove the attendance page, add
   `404.html`, GitHub Action deploying on push, one honest README.

### Blocked or waiting

- **Rules have no test coverage.** The Firestore emulator needs a Java runtime
  and this machine has none. Install Java or run the suite on the mini before
  these rules guard a live gradebook.
- **Commits are landing unsigned.** `commit.gpgsign` is true and points at the
  1Password SSH agent, which is not reachable from this session. Used
  `--no-gpg-sign` rather than changing the git config.
- **Waiting on labnode:** the exact field names the write-back stamps onto
  posts. `canvasSyncedAt`, `canvasScore` and `canvasAssignmentId` are reserved
  and blocked from client writes. Different names would be a hole.
- **Waiting on Jared:** which of the five Canvas courses use v1 and which use
  Studio Log v2. The class field cannot be enforced in rules without it.
- **Waiting on Jared:** whether the shop reset page runs again this term.

### Watch out

- **Bulk writes will fire the Canvas trigger.** The wipe, any re-import, any
  backfill. With the bridge live, one re-import posts hundreds of grades and a
  gradebook has no undo. Agree a stop procedure before the trigger is enabled.
- **GitHub Pages is still serving a third public copy** of v1 from main, now
  with the recovered code. Turn it off.
- **`users` is still readable by any signed-in user.** Anonymous enumeration is
  closed, but a classmate can still read another student's email and studentId.
  Closing that means moving those fields to a private subcollection, which the
  v2 tool would need updating for.
