# PROJECT_CHARTER.md
## Studio Art — Portfolio Web App (Task-first, points-driven)

## 1. Purpose (Canonical)
This repository is a student-facing portfolio system for studio courses.

It exists to help students:
- document process consistently (daily, lightweight),
- publish work in-progress and finished work,
- make iteration visible over time,
- participate in structured challenges (Tasks),
- leave the course with a shareable portfolio URL.

This is not a personal portfolio for the instructor.

## 2. Primary Users
Primary: high school students in studio-based classes  
Secondary: teacher/admin (authoring, moderation, governance)  
Tertiary: external viewers (public portfolios, highlights)

Students are assumed to have:
- uneven technical confidence,
- strong visual intuition,
- limited patience for “systems.”

So the product must privilege clarity and momentum.

## 3. Conceptual Frame
This is a Working Portfolio.

That means:
- process is visible,
- drafts count as real work (but are not always public),
- iteration is expected,
- organization is part of thinking,
- the “loop” matters more than the “post.”

Documentation is studio practice, not admin overhead.

## 4. Core Product Posture
Task-first, not feed-first.

The app is structured around:
Task → Log Work → Points/Badges → Return

Students do not “post into the void.”
They respond to a Task.

## 5. What This Project Is
- a single-instance, multi-tenant web application
- a shared platform hosting all student portfolios
- a static frontend (HTML/CSS/JS) + cloud backend (Firebase)
- a Task system authored by teachers
- a Log Work system authored by students (one log per Task per day)
- a points ledger + leaderboard (competition is intentional)
- a lightweight social layer (likes/comments), not critique

## 6. What This Project Is Not
- not an LMS replacement
- not a grading interface
- not an algorithmic social feed
- not a framework-based engineering exercise
- not a student deployment pipeline

Critique remains external. In-app interactions are social signals (likes/comments), not graded feedback.

## 7. Non-Negotiable Constraints
1) No bundlers, no compile step, no frameworks requiring build tooling  
2) Students never edit code or deploy infrastructure  
3) Teacher-authored Tasks only (students cannot create Tasks)  
4) Logs happen through a Task (no freeform “new post” at top level)  
5) One Log Work per Task per day  
6) Drafts do not earn points  
7) Points are not grades (points = momentum + participation, not assessment)

## 8. Content Model (Canonical)
- Task (teacher-authored)
  - category (Office Hours, News, Project, Chore, Ritual)
  - pointsPerLog
  - optional due window, instructions, attachments, badge hooks

- Log Work (student-authored response to a Task)
  - draft/published
  - media (images/video links)
  - text (optional)
  - timestamp
  - visibility (private/public)

- Engagement (system-authored)
  - likes, comments
  - teacher Features (spotlight)
  - badge awards

- Profile
  - student identity + “ID card” presentation
  - badge display
  - buried “Preview Portfolio” view

## 9. Governance
- Teacher can feature work publicly and award points bonuses.
- Students can like/comment on published work (within permissions).
- Reporting/moderation exists for comments and public content.
- Public visibility is explicit and reversible.

## 10. Aesthetic Direction
The portfolio is an art object.

Design priorities:
- editorial/brutalist clarity
- strong typography
- restraint
- legibility over decoration
- “gallery wall” negative space
- interaction that feels intentional, not gamified UI glitter

## 11. Authority
If any document conflicts:
CANON.md prevails, then this charter, then the rest of the stack.
