# RELEASE_PLAN.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)
Authority: CANON.md

This plan defines what ships in v1, what is explicitly deferred, and what triggers v1.1.

Principle:
- ship the ritual engine first
- never ship scoring without auditability

## v1: Ship the machine

### Milestone 1: Foundations
- Auth
- Tenant membership
- Role gating (student/admin)
- PublicProfiles separation (public-safe docs only)

Exit criteria:
- tenant isolation passes basic tests
- public routes cannot read private docs

### Milestone 2: Tasks spine
- Task Categories (admin)
- Tasks list + Task detail (student)
- Task content rendering per category (minimal)
- “Logged Today” state

Exit criteria:
- students can browse Tasks
- no global log exists
- Tasks are admin-authored only

### Milestone 3: Log Work + publish boundary
- Log Work modal (media, phase, note, visibility)
- publishLog server action
- deterministic logId (user_task_dayKey)
- Draft earns 0 points
- One Log per Task per day enforced

Exit criteria:
- cannot create two logs for same task/day
- points awarded only via server
- basePoints snapshot stored

### Milestone 4: Points + Leaderboards
- pointsEvents audit trail
- scoreboards materialization
- required leaderboard views (total, week, category, phase, social, feature)

Exit criteria:
- leaderboards update on log publish, like, comment, feature
- no client can write scoring fields

### Milestone 5: Social + Highlights
- Likes (points to owner, cap per target)
- Comments (points to commenter, first per target/day)
- Highlights feed
- Pins (student, own work only)
- Features (admin + bonus points)

Exit criteria:
- Highlights never feels dead (teacher can feature, students can pin)
- moderation removal removes points correctly

### Milestone 6: Badges
- badgeDefs
- earned badges per user
- certification auto-award on Office Hours tasks
- streak badges (log streak, iteration streak) with replacement

Exit criteria:
- certifications appear immediately after eligible Office Hours completion
- streak level upgrades replace previous badge

### Milestone 7: Public portfolio + Preview Portfolio
- public portfolio route (public-only logs/projects + public profile)
- Preview Portfolio (buried) uses the same rendering
- publicEnabled gating

Exit criteria:
- public never leaks class-only
- preview shows exactly public view

### Milestone 8: Admin operations
- category editor
- task editor + publish controls
- feature composer
- moderation console
- export panel

Exit criteria:
- teacher can run the course using only admin surfaces

## v1 cut lines (explicitly not in v1)
- DMs
- followers
- algorithmic feeds
- student-created Tasks
- retroactive rescoring
- advanced search (optional)
- notifications (optional)
- units (optional, unless you need “This Unit” now)

## v1.1 triggers
Ship v1.1 only if one of these is true:
- teachers need “units” for meaningful weekly competition
- students need search by name in Highlights
- moderation needs better tooling
- performance demands more denormalization

Candidate v1.1 features:
- Units + “This Unit” leaderboards
- Task-level class feed (recent logs for the task)
- Points ledger view for each student (read-only)
- Search in Highlights
- Notifications for features and comments

