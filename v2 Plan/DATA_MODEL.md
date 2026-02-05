# DATA_MODEL.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)
Authority: CANON.md + LEXICON.md + POINTS_MODEL.md

This file defines the canonical data model (Firestore-first).
If the implementation drifts, fix the implementation.

---

## 0) Design goals

- Logging is gated by a Task.
- One Log per Task per scoring day (enforced).
- Drafts never earn points.
- Points are auditable: every point can be traced to a Log, Like, Comment, or Feature bonus.
- Leaderboards are fast: do not compute totals at read time.
- Forward-only scoring changes: category point edits apply to future Logs only (no retro recalculation).

---

## 1) Tenancy + class structure

The app is multi-tenant (supports multiple classes/sections/years).

Root collection:
- /tenants/{tenantId}

Everything student-facing lives under a tenant.

Recommended tenant fields:
- name
- timezone (default "America/Phoenix")
- active (bool)
- createdAt
- updatedAt

---

## 2) Canonical time keys

### dayKey
String in tenant timezone: "YYYY-MM-DD"

- Used to enforce one Log per Task per day
- Used for streaks and week leaderboards

### weekKey
String: "YYYY-Www" (ISO week in tenant timezone)

---

## 3) Core collections (per tenant)

### A) Users
Path:
- /tenants/{tenantId}/users/{userId}

Fields:
- role: "student" | "admin"
- active: bool
- fullName: string
- handle: string (optional)
- photoUrl: string (optional)
- bio: string (optional)
- links: string[] (optional)
- publicEnabled: bool
- createdAt, updatedAt, lastLoginAt

Denormalized scoring fields (fast ID card / quick display):
- pointsTotal: number
- pointsLogsTotal: number
- pointsSocialTotal: number
- pointsFeatureTotal: number
- streakLogCurrent: number
- streakIterationCurrent: number

Note: canonical leaderboard ordering uses Scoreboards (Section 6), not user sorting.

---

### B) Task Categories
Path:
- /tenants/{tenantId}/taskCategories/{categoryId}

Fields:
- name: "Office Hours" | "News" | "Project" | "Chore" | "Ritual"
- pointsPerLog: number  (v1 boot values: 253 / 126 / 371 / 184 / 213)
- enabled: bool
- sortOrder: number
- createdAt, updatedAt

Important:
- pointsPerLog is used as the base value for Logs under Tasks in this category.
- if pointsPerLog changes, it applies forward-only.

---

### C) Tasks
Path:
- /tenants/{tenantId}/tasks/{taskId}

Fields (base):
- categoryId
- title
- subtitle (optional)
- body (optional)
- status: "draft" | "published" | "archived"
- isPinned: bool (optional “keep near top”)
- openAt: timestamp (optional)
- closeAt: timestamp (optional)
- createdAt, updatedAt
- createdByUserId (admin)

Content payload (category-specific):
- content: object (flexible, schemaVersioned)

Suggested content fields per category:
- Office Hours:
  - videoUrl (optional)
  - resourceLinks (optional)
  - certificationBadgeId (optional, auto-award on eligible Log)
- News:
  - announcementType (optional)
- Project:
  - projectTemplate (optional)
- Chore:
  - checklist (optional)
- Ritual:
  - recurrenceHint (optional)

---

### D) Projects
Path:
- /tenants/{tenantId}/projects/{projectId}

Fields:
- ownerUserId
- title
- coverMedia: MediaRef (see MediaRef below)
- statement: string
- tags: string[]
- visibility: "draft" | "class" | "public"
- createdAt, updatedAt
- deletedAt (optional)

Social aggregates (optional denormalized):
- likeCount
- commentCount

---

### E) Logs
Path:
- /tenants/{tenantId}/logs/{logId}

Critical: enforce one Log per Task per day by deterministic ID:

logId format (recommended):
- "{userId}_{taskId}_{dayKey}"

Fields:
- ownerUserId
- taskId
- categoryId (denormalized from Task at time of logging)
- dayKey
- weekKey
- phase: "Sketch" | "Build" | "Test" | "Iteration" | "Reflection"
- note: string
- media: MediaRef[] (>= 1)
- projectId (optional)
- visibility: "draft" | "class" | "public"
- createdAt, updatedAt
- deletedAt (optional)

Denormalized scoring snapshot (to make social scoring stable and auditable):
- basePoints: number   (pointsPerLog captured at creation time)
- eligibleForPoints: bool  (false when draft; true when class/public)
- featureBonusAwarded: bool
- featureBonusValue: number (optional)

Social aggregates (optional denormalized):
- likeCount
- commentCount

Why basePoints is stored on the Log:
- social points depend on “1/10 of the log”
- teacher category point edits are forward-only
- basePoints locks the value for future derived scoring

---

### F) Reactions (Likes)
Path:
- /tenants/{tenantId}/likes/{likeId}

Enforce “one like per user per target” via deterministic ID:

likeId format:
- "{likerUserId}_{targetType}_{targetId}"

Fields:
- likerUserId
- targetType: "log" | "project"
- targetId
- targetOwnerUserId (denormalized for scoring)
- createdAt
- removedAt (optional)

Points behavior:
- Like awards points to targetOwnerUserId.
- Like points cap per target is enforced in PointsEvents/Score updates.

---

### G) Comments
Path:
- /tenants/{tenantId}/comments/{commentId}

Fields:
- authorUserId
- targetType: "log" | "project"
- targetId
- targetOwnerUserId (denormalized, optional)
- body: string
- createdAt
- dayKey
- removedAt (optional)
- removedByUserId (optional)
- removalReason (optional)

Points behavior:
- first comment per commenter per target per day counts for points
- enforce via PointsEvents uniqueness (below), not via comment storage

---

### H) Highlights (Pins + Features)
Path:
- /tenants/{tenantId}/highlights/{highlightId}

Two types:
- "pin" (student)
- "feature" (teacher)

Fields:
- type: "pin" | "feature"
- createdByUserId
- targetType: "log" | "project"
- targetId
- targetOwnerUserId
- categoryLabel: string (required for feature; optional for pin)
- createdAt
- removedAt (optional)

Points behavior:
- Feature grants a bonus (fixed 1/2 of basePoints).
- One feature bonus per target in v1 (enforced via PointsEvents).

---

### I) Badges (definitions)
Path:
- /tenants/{tenantId}/badgeDefs/{badgeId}

Fields:
- family: "certification" | "streak"
- name
- icon (optional)
- description (optional)
- sortOrder (for two-column presentation)
- createdAt, updatedAt

For certifications:
- tied to Office Hours tasks via tasks.certificationBadgeId

For streaks:
- use badgeIds like:
  - "log_streak_L1" ... "log_streak_L5"
  - "iter_streak_L1" ... "iter_streak_L5"

---

### J) Earned Badges (per user)
Path:
- /tenants/{tenantId}/users/{userId}/badges/{badgeId}

Fields:
- badgeId
- earnedAt
- revokedAt (optional)
- earnedBy: "system" | "admin"
- sourceTaskId (optional for certifications)
- sourceLogId (optional)
- notes (optional)

Replacement rule for hierarchical streak badges:
- when awarding L(n), revoke L(n-1) in the same family for that user

---

### K) Points Events (audit log)
Path:
- /tenants/{tenantId}/pointsEvents/{eventId}

This is the canonical audit trail.
Every scoring change writes an event.

eventId should be deterministic where uniqueness matters.

Fields (base):
- userId (recipient of points)
- type:
  - "log_award"
  - "log_remove"
  - "like_award"
  - "like_remove"
  - "comment_award"
  - "comment_remove"
  - "feature_award"
  - "feature_remove"
- delta: number (positive or negative)
- createdAt
- dayKey
- weekKey
- source:
  - sourceType: "log" | "project" | "like" | "comment" | "highlight"
  - sourceId
  - actorUserId (who caused it; system/admin/student)
- meta: object (optional; snapshot basePoints, caps, etc.)

Deterministic IDs (recommended):
- log award/remove:
  - "log_{logId}"
- like award/remove:
  - "like_{likeId}"
- comment award (first per target/day):
  - "comment_{authorUserId}_{targetType}_{targetId}_{dayKey}"
- feature award/remove:
  - "feature_{highlightId}"

This guarantees “first counts” and prevents double-awards.

---

## 4) Required write behaviors (v1)

### Log creation
- client selects a Task, creates logId = userId_taskId_dayKey
- write Log with basePoints = current category pointsPerLog
- if visibility != draft:
  - write pointsEvents/log_award
  - increment user point totals
  - update scoreboards (Section 6)
  - if Office Hours task has certificationBadgeId:
    - award certification badge (system)

### Draft publish
- change log.visibility from draft → class/public
- set eligibleForPoints true
- if no log_award exists for that logId:
  - award points now

### Delete log
- set deletedAt (soft delete)
- remove points via pointsEvents/log_remove
- remove derived points events for likes/comments/features if you choose strict deletion
  (recommended: yes, for audit consistency)

### Like
- create likeId = liker_targetType_targetId
- award points to target owner via like_award event (subject to cap logic)
- update scoreboards

### Comment
- create comment doc
- attempt to create deterministic comment_award event for that target/day
  - if event already exists, comment still posts but awards no points

### Feature
- create highlight doc (type = feature)
- create feature_award event once per target
- update scoreboards

---

## 5) Query patterns (v1)

### Tasks list (Tasks tab)
- tasks where status == "published"
- order by openAt desc (or updatedAt desc if openAt not used)
- filter/section by categoryId
- support "New" indicators via updatedAt comparisons or per-user taskSeen markers (optional)

### Student Studio Log
- logs where ownerUserId == currentUserId and deletedAt == null
- order by createdAt desc

### Student Projects
- projects where ownerUserId == currentUserId and deletedAt == null
- order by updatedAt desc

### Highlights feed
- highlights where removedAt == null
- order by createdAt desc
- include target summaries via denormalized fields or batched fetch

### Leaderboards
- read from scoreboards entries (below)

---

## 6) Scoreboards (leaderboard materialization)

Do not sort users directly by points fields for every leaderboard view.
Materialize leaderboards as scoreboards.

Path:
- /tenants/{tenantId}/scoreboards/{boardId}
- /tenants/{tenantId}/scoreboards/{boardId}/entries/{userId}

Scoreboard doc:
- boardId
- title
- dimension: "total" | "category" | "phase" | "social" | "feature"
- window: "alltime" | "week" | "unit"
- key: string (e.g. categoryId or phase or weekKey)
- updatedAt

Entry doc fields:
- userId
- score: number
- rankHint (optional)
- updatedAt

Required boardIds (v1):
- total_alltime
- total_week_{weekKey}
- category_{categoryId}_alltime
- phase_{phase}_alltime
- social_alltime
- feature_alltime

Optional:
- unit boards once “units” are defined

Update strategy:
- on each PointsEvent, increment the appropriate entry.score values
- keep deltas consistent with PointsEvents

---

## 7) Optional: Units (only if you want “This Unit”)
Path:
- /tenants/{tenantId}/units/{unitId}

Fields:
- title
- startAt, endAt
- createdAt, updatedAt

Then add to Tasks:
- unitId (optional)

Then you can materialize:
- total_unit_{unitId}
- category_{categoryId}_u
