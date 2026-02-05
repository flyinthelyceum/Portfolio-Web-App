# CANON.md
Portfolio Web App (Working Portfolio)
Version: v1 (canonical draft)

This file is the constitution.
If anything conflicts with CANON.md, CANON wins.

---

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

If the app becomes a résumé tool, a branding exercise, or an anxiety machine, we failed.

---

## 2) North Star

Fastest path from “I made something” to “I logged it with clarity.”

The system should make it easy to:
- capture evidence quickly
- name the phase
- show change over time
- return to work later and see growth

---

## 3) The Three Surfaces (ISRU-inspired)

1) ID (Home)
A single identity object that summarizes practice and current work.

2) Studio Log
The chronological working record. This is the default habitat.

3) Showcase
A curated wall. Not the main loop.
A place where work gets featured, pinned, and seen.

---

## 4) Canonical Objects

### Log (proof-first)
The atomic unit.
Images first, text second.

Minimum required:
- media (1+)
- phase tag (sketch / build / test / iteration / reflection)
- short note (1–3 sentences: what changed and why)
- timestamp
- visibility state
- container (Project OR Daily Practice)

### Project
A coherent arc that can contain many Logs.

Minimum required:
- title
- cover media
- statement (short)
- tags (tools / materials / themes)

### Daily Practice (default container)
If a Log is not placed in a Project, it goes here by default.
This prevents loose media and decision fatigue.

### Feature (Showcase item)
A featured Log or Project shown in Showcase.

Feature sources:
- Student Pin (student chooses “put this on my wall”)
- Teacher Feature (teacher highlights work for the class)

Feature is curation, not ranking.

---

## 5) Core Loop

Make → Log proof → Tag phase → Share to class → Return → Revise → Log again

Support loops:
- Onboarding: first Log in under 2 minutes
- Recovery: drafts never disappear, edits are safe
- Curation: pins + teacher features create visibility without ranking
- Search: find work later by project, phase, tag

---

## 6) Roles and Authority

Roles:
- Student: create/edit own Logs and Projects, pin items to Showcase, like/comment (within allowed visibility)
- Instructor/Admin: view all student work, feature items, manage accounts, moderate, export

The app does not rank students.
No leaderboards. No points. No streak scoreboards.

---

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

---

## 8) Social Interaction (classroom energy, not competition)

Allowed:
- Likes (simple signal of attention)
- Comments (short, human, conversational)

Constraints:
- Likes/comments are only visible within the same visibility boundary as the content
  - Draft: none
  - Class: class-only
  - Public: visible on public page (optional switch per post, if needed)

No gamified totals that turn into ranking.
No “most liked this week.”
No follower counts.

Moderation:
- instructor can remove comments and restrict accounts if needed
- actions are logged (audit trail)

---

## 9) Non-Negotiables

1) No student code, no student deployment.
Students only use the web interface.

2) No build step for the student-facing experience.
Small libraries via CDN are allowed if they do not introduce a build pipeline.

3) Posting must be fast.
A Log should be creatable in under 30 seconds once familiar.

4) The system teaches by doing.
Minimal tutorials. Strong defaults. Clear verbs.

5) Everything has a place.
No loose media. Every Log belongs to a Project or Daily Practice.

6) Design is a studio tool.
The UI should feel like a field manual or studio notebook, not a dashboard.

---

## 10) Language (canonical nouns and verbs)

Nouns:
- Log, Project, Artifact, Phase, Tag, Draft, Class, Public, Showcase, Pin, Feature

Verbs:
- Log, Add, Tag, Revise, Pin, Feature, Publish, Archive, Export, Comment, Like

No synonyms in the UI.
We do not drift into “post” unless we choose it and lock it here.

---

## 11) Microcopy Rules (tone)

- concrete verbs
- one instruction per sentence
- no motivational fog
- errors blame the system, not the student
- empty states teach the next action

Examples:
- “Add photos.”
- “Tag the phase.”
- “Say what changed.”
- “Saved to Draft.”
- “Publish to Class.”
- “Pin to Showcase.”

---

## 12) Navigation Constraint

Three tabs max for v1:
- ID
- Studio Log
- Showcase

Everything else lives behind the gear:
- settings
- account
- exports
- admin tools
- moderation tools

---

## 13) Out of Scope (v1)

- leaderboards, rankings, points, streak scores
- follower/following graphs
- direct messages
- algorithmic feeds
- public-by-default posting
- complex formatting, longform blogging tools
- student-managed hosting or custom domains
- graded critique tooling inside the app

Critique happens in real space.
The app supports documentation and social attention, not assessment.

---

## 14) Decision Test

A feature is approved only if:
- it strengthens the core loop
- it reduces friction to logging proof
- it increases clarity of process over time
- it respects school-safe privacy defaults
- it fits the three-surface model

If a feature increases performance anxiety or turns into comparison behavior, reject it or redesign it.

---

## 15) Canon Stack (documents this file governs)

- PROJECT_CHARTER.md
- UX_PRINCIPLES.md
- LEXICON.md
- DATA_MODEL.md
- VISIBILITY_AND_ROLES.md
- SECURITY_RULES_PLAN.md
- IA_MAP.md
- USER_FLOWS.md
- EMPTY_STATES.md
