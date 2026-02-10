# CANON.md
Portfolio Web App (Working Portfolio)
Version: v1 (canonical)

This file is the constitution.
If anything conflicts with CANON.md, CANON wins.

## 1) Thesis

This is not an archive.
This is not a highlight reel.
This is a Working Portfolio.

The app exists to make practice visible:
- proof
- process
- iteration
- constraints
- authorship over time

If the app becomes a résumé tool or a branding exercise, we failed.

## 2) North Star

Fastest path from “I made something” to “I logged it with clarity.”

The system should make it easy to:
- capture evidence quickly
- name the phase
- attach the log to a specific Task
- return later and see growth

## 3) Primary Surfaces (ISRU-inspired)

1) Home (ID)
A single identity artifact that summarizes practice and status.

2) Tasks
A running list of teacher-authored Tasks. Logging only happens through a Task.

3) Highlights
Curated social viewing (pins + teacher features).

4) Leaderboard
Competitive, filterable, points-driven.

Preview Portfolio exists, but it is intentionally buried.

## 4) Canonical Objects

### Task
A teacher-authored unit that gates logging.
Students cannot create Logs without selecting a Task.
Tasks are explicitly tied to a Task Category.

Default Task Categories (v1):
- Office Hours
- News
- Project
- Chore
- Ritual

### Log
The atomic unit of documentation.
Images first, text second.
A Log always belongs to exactly one Task.
A Log may optionally also belong to a Project.

Minimum required:
- media (1+)
- phase tag (Sketch / Build / Test / Iteration / Reflection)
- short note (1–3 sentences: what changed and why)
- timestamp
- visibility state
- taskId (required)
- projectId (optional)

### Project
A coherent arc that can collect Logs.
Projects are optional, but allowed.

Minimum required:
- title
- cover media
- statement (short)
- tags (tools / materials / themes)

### Feature
Teacher-curated surfacing into Highlights.
Features always include a category label.
Features award bonus points (see Section 8).

### Pin
Student-curated surfacing into Highlights.

### Like / Comment
Social interaction on Logs and (optionally) Projects, within visibility boundaries.
Comments are freeform.

### Badge
Badges display on the ID.
Badges are organized in two unlabeled columns:
- Certifications
- Streaks

## 5) Core Loop

Select Task → Do the thing → Log Work → Publish to Class → Return → Revise → Log Work again

Support loops:
- Onboarding: first Log in under 2 minutes
- Recovery: drafts never disappear, edits are safe
- Social: likes/comments reward attention and engagement
- Curation: pins + teacher features feed Highlights
- Competition: points + leaderboards drive ritual consistency
- Search: find work later by project, phase, tag, task, category

## 6) Roles and Authority

Roles:
- Student: create/edit own Logs and Projects, like/comment (within visibility), pin work
- Instructor/Admin: view all student work, author Tasks and Categories, feature work, moderate, manage accounts, export

## 7) Visibility Defaults (school-safe)

Visibility states:
- Draft: only the student
- Class: class + instructor
- Public: public URL

Defaults:
- new Logs default to Class
- new Projects default to Class
- Public publishing is explicit, reversible, and clearly labeled everywhere

Public identity:
- public portfolios show full student name

Drafts are sacred:
- no silent loss
- destructive actions require confirmation
- recovery must exist (draft state at minimum)

## 8) Points + Competitive Leaderboards (Canonical)

Competition is intentional.
Leaderboards are first-class.

Point sources:
1) Logs (primary)
2) Likes + Comments (social, low weight)
3) Teacher Features (bonus)

Hard rules:
- Drafts never earn points
- One Log per Task per calendar day

Category scoring:
- pointsPerLog is defined per Task Category
- pointsPerLog is set by the teacher/admin when creating the category
- values live in the 100s and weird numbers are encouraged (example: 483)

Social scoring:
- Likes and Comments award points at 1/10 the value of the Log’s pointsPerLog
- anti-farming caps apply (defined in POINTS_MODEL.md)

Teacher Feature bonus:
- a Feature grants a fixed bonus equal to 1/2 the Log’s pointsPerLog
- one Feature bonus per Log in v1 (unless changed later in the points model)

Leaderboard views (minimum):
- Total Points
- This Week
- This Unit (if units exist)
- By Task Category
- By Phase
- Social Points
- Feature Points

All scoring rules must be auditable and explainable.
Exact rules live in POINTS_MODEL.md (canonical).

## 9) Social Interaction (Canonical)

Allowed:
- Likes
- Freeform comments

Constraints:
- likes/comments respect the same visibility boundary as the content
  - Draft: none
  - Class: class-only
  - Public: public page (optional toggle if needed)

Moderation:
- instructor can remove comments and restrict accounts
- actions are logged (audit trail)

## 10) Non-Negotiables

1) No student code, no student deployment.
Students only use the web interface.

2) No build step for the student-facing experience.
Small libraries via CDN are allowed if they do not introduce a build pipeline.

3) Logging must be fast.
A Log should be creatable in under 30 seconds once familiar.

4) The system teaches by doing.
Minimal tutorials. Strong defaults. Clear verbs.

5) Everything has a place.
No loose media.
Every Log belongs to a Task.
Projects are optional.

6) Design is a studio tool.
The UI should feel like a studio manual, not a dashboard.

## 11) Language (Canonical)

Canonical UI nouns:
- Task, Log, Project, Highlights, Leaderboard, Points, Feature, Pin, Badge

Canonical UI verbs:
- Log Work, Tag, Publish, Pin, Feature, Like, Comment, Preview Portfolio

No synonyms in UI.
Final labels are governed by LEXICON.md.

## 12) Navigation Constraint

Primary nav surfaces for v1:
- Home
- Tasks
- Highlights
- Leaderboard

Buried:
- Preview Portfolio
- Settings
- Account
- Export

Preview Portfolio should feel like a dating app profile:
available, but not the point.

## 13) Out of Scope (v1)

- follower/following graphs
- direct messages
- algorithmic feeds
- public-by-default posting
- longform blogging tools
- student-managed hosting or custom domains
- graded critique tooling inside the app

Critique happens in real space.
The app supports documentation, social attention, and competition.

## 14) Decision Test

A feature is approved only if:
- it strengthens the core loop (Task → Log Work)
- it reduces friction to proof logging
- it increases clarity of process over time
- it respects privacy defaults
- it supports points/competition without becoming arbitrary or opaque

## 15) Canon Stack (Documents this file governs)

Required:
- PROJECT_CHARTER.md
- LEXICON.md
- POINTS_MODEL.md
- DATA_MODEL.md
- VISIBILITY_AND_ROLES.md
- SECURITY_RULES_PLAN.md
- IA_MAP.md
- USER_FLOWS.md
- EMPTY_STATES.md
