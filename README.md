# Portfolio Web App

Student portfolio tools for high school art and technology classes at Brophy.
Two apps, one Firebase project, no build step.

| Tool | URL | Serves | Source |
|---|---|---|---|
| v1 Portfolio | https://test.aaand.space | Working Artist Portfolio | this branch, repo root |
| Studio Log v2 | https://portfolio-v2-log.web.app | the other class | `studio-log-redesign`, `v2/` |

Students post work to the app. A Cloud Function grades the entry in Canvas and
comments with a link back to it, so logging work is the assignment rather than
something recommended alongside it.

## Stack

Static HTML, CSS and ES modules. No framework, no bundler, no build. The Firebase
SDK loads from the CDN at version 12.8.0.

- **Hosting** Firebase Hosting, two sites in one project, Cloudflare DNS in front
- **Auth** Firebase Auth, Google SSO against `@brophybroncos.org`
- **Data** Firestore
- **Media** Firebase Storage, resized client side before upload
- **Grading** Cloud Functions in `functions/`, writing to the Canvas REST API

It is not on GitHub Pages and it is not on Vercel. GitHub Pages served a third
stale copy of v1 until 11 Aug 2026 and is now switched off.

## Read these before changing anything

| File | What it is |
|---|---|
| `CLAUDE.md` | who works where, and how the two machines avoid colliding |
| `CANVAS_WRITEBACK.md` | the Canvas design record, written against live API tests |
| `INTERLOCKS.md` | the seam between the app and the grading integration |
| `SESSION_LOG.md` | what happened last session and what is next |

## Layout

```
index.html  app.js         public portfolio, no login required
login.html  signup.html    auth, creates the profile on first sign-in
editor.html editor.js      student dashboard, where work gets posted
profile.html profile.js    profile editing
admin.html  moderation.html  instructor views
identity.js                username and profile records
image-resize.js            resize before upload
error-reporting.js         client errors into Firestore

firestore.rules            covers BOTH tools, see the warning below
storage.rules              covers all four media prefixes
firestore.indexes.json     includes the index the grading query needs

functions/                 Canvas write-back (labnode lane)
scripts/                   one-off operational scripts
v2/                        Studio Log v2, on the studio-log-redesign branch
```

## Deploying

Pushing to `main` deploys the v1 site through
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). That workflow needs
a `FIREBASE_SERVICE_ACCOUNT` repository secret, which is not set yet.

**Rules and indexes do not deploy automatically, on purpose.** Both classes share
one Firestore project, so a bad rules deploy locks the other class out of their
tool while they are using it. Deploy them deliberately, from the
`workflow_dispatch` trigger or by hand:

```bash
# always dry run first
firebase deploy --only firestore:rules --dry-run --project portfolio-web-app-26

firebase deploy --only firestore:rules,firestore:indexes,storage --project portfolio-web-app-26
```

Hosting by hand, if you need it, is per site:

```bash
firebase deploy --only hosting:portfolio-web-app-26   # v1
firebase deploy --only hosting:portfolio-v2-log       # v2, from the v2 branch
```

A bare `firebase deploy` touches both sites. Use `--only`.

## Local

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Auth and Firestore talk to the live project, so
anything you create locally is real. There is no emulator setup yet; running the
rules tests would need one, plus a Java runtime.

## Operational scripts

```bash
# Archive a semester before clearing it. Read only, deletes nothing.
node scripts/archive-semester.mjs
node scripts/archive-semester.mjs --skip-storage      # metadata only, fast

# Bulk student import from CSV, needs Admin credentials
node scripts/import-students.js
```

The archive writes Firestore, the auth roster, the whole Storage bucket and a
readable per-student index. Read its `INDEX.md` first. It contains email
addresses and password hashes for minors, so keep it off shared drives and out
of this repo.

## Conventions

Commit messages are `type: description` with a prose body. They are read by
other agents working in this repo, not only by people, so say what changed and
why. No em dashes anywhere, including code comments.
