# CLAUDE.md: Portfolio-Web-App

Auto-loaded into every Claude Code session opened in this repo. Read it before touching anything.

## What this is

The student artist-portfolio web app behind **https://test.aaand.space**. Firebase-backed static front end, deployed through Firebase Hosting, fronted by Cloudflare. **Not on Vercel.** Owner: Jared Reasy (`flyinthelyceum/Portfolio-Web-App`).

It is the thing the Art & Technology **Working Artist Portfolio** assignment is about, so it has real students on it during the fall 2026 term.

## Who is working here, and how to not collide

More than one agent touches this repo. As of 2026-08-10:

| where | who | doing what |
|---|---|---|
| MacBook, VS Code | Jared plus a Claude Code session | app front end, design system, editor |
| Mac mini (labnode), always-on | Jared's primary Claude | Canvas write-back, roster and grading integration |

**Coordination protocol, because there is no shared session state:**

1. **The repo is the channel.** Anything another agent needs to know goes in a committed file, not in a chat message that the other side will never see.
2. **Pull with rebase before you push.** Both sides push to `main` and it has already collided once. `git pull --rebase && git push`.
3. **Stay in your lane by directory.** Front end (`*.html`, `app.js`, `editor.js`, `profile.js`, `admin.js`, `assets/`) belongs to the VS Code session. Canvas and grading integration (`functions/`, `scripts/canvas-*`, `CANVAS_WRITEBACK.md`) belongs to the labnode session. If you need to cross, say so in the commit message.
4. **Announce big moves in the commit message, in prose.** Commit messages here are read by other agents, not just humans. Say what changed and why, not just what file.

## Read before working on Canvas integration

**`CANVAS_WRITEBACK.md`** is the design record, written against live API tests rather than docs. It carries the tested constraints (no CORS, no masquerade, no admin), the architecture, and three rounds of Jared's corrections. Do not redesign the write-back without reading it; the obvious approaches are all already ruled out with HTTP codes attached.

**`INTERLOCKS.md`** is the seam between the two lanes, written from the app side. It carries what the app now guarantees to the bridge (post ownership, server timestamps, `authorEmail`), what it does not yet guarantee, the hazards that will cost the Canvas work time, and open requests in both directions. Read it before seeding a roster or enabling the Firestore trigger.

## Jared's rules that bind this repo

- **Quality never becomes a number.** The Canvas score runs on mechanical checks only: does it exist, did it arrive in the window, does it have the parts. Commentary can carry real evaluation and should, but it must never contain a number, rank, letter, or score-shaped phrase. Two channels, fully decoupled.
- **Never put `CANVAS_API_TOKEN` in client code or Firestore.** It is a full-privilege teacher credential covering 125 students across five courses.
- **Refuse rather than guess on identity.** If a student's email does not resolve to a Canvas user id, write an error doc and stop. A wrong guess posts one student's work onto another student's grade.
- **Writing style, no exceptions:** no em dashes, anywhere, including code comments and commit messages. No dead vocabulary (delve, tapestry, pivotal, crucial, testament). No "not just X, it's Y." Full rules in `~/.claude/house-style.md` on Jared's machines.

## Local clones

- **MacBook `~/Projects/Portfolio-Web-App`** is Jared's working copy.
- **Mini `~/projects/Portfolio-Web-App`** is the labnode copy. Historically treated as read-only; as of 2026-08-10 it also writes the Canvas integration. Pull before touching, push immediately after.
- Before 2026-08-10 there was no local clone anywhere. GitHub held six months of work as the only copy. Do not let that recur: push.
