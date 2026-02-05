# README.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)

This repo contains a studio-first portfolio web app for high school students.
It is built around Tasks, Logs, Points, and social engagement.

If you only read one file: CANON.md

---

## What this is

A Working Portfolio system.

Students do not “post.”
They select a Task, do the thing, then Log Work.

The app includes:
- Home (ID): identity + badges + points
- Tasks: the spine (teacher-authored)
- Highlights: social wall (Pins + Features)
- Leaderboard: competitive, filterable points views
- Preview Portfolio: buried public-view mode

---

## Core loop

Select Task → Do the thing → Log Work → Publish to Class → Return → Revise → Log Work again

Hard constraint:
- one Log per Task per day

---

## Key product rules

1) Logging is Task-gated
- no global “+ Log”
- every Log belongs to exactly one Task

2) Points are real and auditable
- Drafts never earn points
- students cannot write scoring fields
- every scoring change is explainable via PointsEvents

3) Social engagement matters
- Likes award points to the owner (low-weight)
- Comments award points to the commenter (low-weight)
- both are worth 1/10 of the base value

4) Competition is intentional
- leaderboards are first-class
- multiple leaderboard views (total, week, category, phase, social, feature)

5) Features are teacher interventions
- Features surface work in Highlights
- Feature bonus is fixed: half the base value (once per target)

6) Badges are two families
- Certifications: auto-awarded by completing specific Office Hours tasks
- Streaks: hierarchical and replacing (Log Streak + Iteration Streak)

---

## Canonical docs (read in this order)

1) CANON.md
2) LEXICON.md
3) POINTS_MODEL.md
4) DATA_MODEL.md
5) VISIBILITY_AND_ROLES.md
6) SECURITY_RULES_PLAN.md
7) IA_MAP.md
8) USER_FLOWS.md
9) EMPTY_STATES.md
10) PROJECT_CHARTER.md

---

## Data model (short)

Tenant structure:
- /tenants/{tenantId}/...

Key collections:
- users, publicProfiles
- taskCategories, tasks
- logs, projects
- likes, comments
- highlights
- badgeDefs, users/{userId}/badges
- pointsEvents (audit)
- scoreboards/{boardId}/entries/{userId}

Scoring integrity requires server-side actions (Cloud Functions or server routes).

---

## Security posture (short)

- Tenant isolation is absolute.
- Public can read only:
  - publicProfiles where publicEnabled == true
  - logs/projects where visibility == public
- Students can create/edit their own Logs/Projects.
- Students cannot write:
  - pointsEvents, scoreboards, badges, basePoints, dayKey/weekKey
- Admin authors Tasks and Categories, Features work, moderates comments, exports data.

---

## Leaderboards (v1 views)

- Total Points (all time)
- Total Points (this week)
- By Task Category (all time / week)
- By Phase (all time / week)
- Social Points (all time / week)
- Feature Points (all time / week)

---

## UI vocabulary (do not drift)

Nouns:
- Task, Log, Project, Highlights, Leaderboard, Points, Feature, Pin, Badge

Verbs:
- Log Work, Publish, Like, Comment, Preview Portfolio

No “Post.”
No “Assignment.”
No “Feed” unless we mean Highlights.

---

## Build constraints

- Students do not touch code or deployment.
- Student experience must not require a build step.
- Admin tools are role-gated.
- System scoring must be auditable.

---

## Implementation notes (recommended)

- Firestore + Firebase Auth
- Cloud Functions (or server actions) for:
  - publishLog (compute dayKey, enforce uniqueness, award points/badges)
  - onCreateLike / onCreateComment (award social points)
  - onCreateFeature (award bonus)
  - moderation removals (remove points where applicable)
- Materialize leaderboards via scoreboards docs (do not sort at query time).

---

## Where to start (for a new contributor)

1) Read CANON.md and LEXICON.md
2) Implement Tasks index + Task detail + Log Work modal
3) Implement publishLog server action (scoring boundary)
4) Implement ID card (points + badges)
5) Implement Leaderboards from scoreboards
6) Implement Highlights + Pins + Features
7) Implement Public Portfolio route + Preview Portfolio mode
8) Add moderation + exports

