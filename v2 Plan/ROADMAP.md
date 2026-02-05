# ROADMAP.md — Path to Ship (Task-first + Points)

**Portfolio Web App — Firebase Multi-Tenant Architecture**  
**Last Updated:** February 4, 2026  
**Canonical Reference:** PROJECT_CHARTER.md  
**Product Truth:** CANON.md

## Overview
Ship a working Task-first system where:
- students log in
- students choose a Task
- students Log Work (draft or publish)
- published work can receive likes/comments
- points accumulate automatically
- leaderboard and highlights create momentum
- teachers author Tasks and feature work

## Architecture Shift (still correct)
From GitHub/Decap/OAuth to Firebase (Firestore + Storage + Auth) and a single shared web app.

## Key Product Decisions (Updated)
- Logging is Task-first (no freeform + Log at top level)
- Teacher-authored Tasks only
- One log per Task per day
- Drafts earn 0 points
- Likes/comments earn ~1/10 of log value
- Teacher Features award +1/2 log value
- Leaderboard is competitive and intentional
- Critique is external; in-app feedback is social only

## Phases

### Phase 1: Infrastructure (Firebase)
Same as current plan:
Auth, Firestore, Storage, security rules, config.

### Phase 2: Core Student Loop (MVP)
Goal: Task → Log Work → Publish → View points

Deliverables:
- login/auth
- Home “ID card” view (name, badges, points total)
- Tasks list (by category, “new” indicators)
- Task detail page
  - “Log Work” action
  - shows whether today is already logged
- Log Work editor
  - images upload
  - draft/publish toggle
  - save/confirmation state
- Portfolio view (buried)
  - shows published log work and projects

### Phase 3: Points + Ledger
Goal: points accumulate correctly, transparently
- points computed on publish
- points ledger per user
- category totals (Office Hours, News, Project, Chore, Ritual)
- cached totals for fast leaderboard

### Phase 4: Leaderboard + Filters
Goal: competitive leaderboard with multiple lenses
- Total points (default)
- Filter by category
- Optional time window (this week / this month / all time)

### Phase 5: Social Layer (Lightweight)
Goal: increase interaction without turning into a feed
- likes on published work
- comments on published work (freeform)
- abuse controls (report/delete, teacher moderation)

### Phase 6: Highlights + Features
Goal: curated visibility
- highlights page (teacher featured work + top public work)
- teacher “Feature” action gives bonus points (+1/2 log value)

### Phase 7: Teacher Tools
Goal: teacher can run the system
- teacher Task authoring UI (create/edit/archive)
- set pointsPerLog per Task
- moderation UI for comments and public content
- export (JSON/CSV)

### Phase 8: Deployment & Testing
- deploy to Firebase Hosting
- test full loop with 3 students
- verify public/private behavior
- verify points integrity and anti-spam constraints

## Success Metrics (Updated)
MVP launch:
- 20 students have accounts
- 80% post at least 3 times in first week
- leaderboard populates with real data
- highlights page has visible activity

End of semester:
- consistent daily logging behavior
- projects are legible as “Project” category work
- public portfolio links are shareable and clean
