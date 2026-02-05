# SECURITY_RULES_PLAN.md
Portfolio Web App (Working Portfolio)
Version: v1 (plan)
Authority: CANON.md + DATA_MODEL.md + POINTS_MODEL.md + VISIBILITY_AND_ROLES.md

This document specifies the security posture and the rule boundaries.
It is intentionally strict: points and competition require anti-cheat.

## 0) Core posture

- Tenant isolation is absolute.
- Students can write content, not scoring.
- Points, badges, and scoreboards are server-controlled.
- Public access is limited to Public visibility content + public profile docs only.

Implementation note:
Firestore rules cannot enforce “Phoenix dayKey” computation.
Any rule that depends on dayKey/weekKey must be system-controlled via Cloud Functions (recommended).

## 1) Required primitives (rules helpers)

Required helpers in rules (conceptually):

- isSignedIn()
- isTenantMember(tenantId)
  - true if /tenants/{tenantId}/users/{request.auth.uid} exists and active == true

- isAdmin(tenantId)
  - role == "admin" in tenant user doc

- isSelf(userId)
  - request.auth.uid == userId

- isPublicProfileReadable(tenantId, userId)
  - /tenants/{tenantId}/publicProfiles/{userId}.publicEnabled == true

- visibility checks:
  - canReadLogOrProject(doc):
    - if doc.visibility == "public" => allow
    - else require isTenantMember
    - draft requires owner or admin

## 2) Collection-by-collection access plan

All paths below are within:
- /tenants/{tenantId}/...

### A) users/{userId}  (private member record)
Read:
- tenant members can read (for class identity + points inside class)
Write:
- user can update limited profile fields only (handle/photoUrl/bio/links)
- user cannot write role, points totals, moderation flags
- admin can update role, active, moderation flags

Strong recommendation:
- keep points totals and moderation flags in this private doc
- do not allow public reads to this doc

### B) publicProfiles/{userId}  (public-readable record)
Read:
- if publicEnabled == true => anyone can read
- tenant members can read regardless (for internal rendering)
Write:
- user can update their own public-facing fields (fullName/photo/bio/links), but cannot set publicEnabled true unless teacher allows (optional)
- admin can toggle publicEnabled, and can override fields if needed

Rationale:
- Firestore cannot restrict fields on read; this doc must contain only public-safe fields.

### C) taskCategories/{categoryId}
Read:
- tenant members
Write:
- admin only

### D) tasks/{taskId}
Read:
- tenant members
Write:
- admin only

### E) projects/{projectId}
Read:
- if visibility == public => anyone
- else tenant members
- draft requires owner or admin

Write:
- owner can create/update/delete their own projects (soft delete)
- owner cannot write scoring fields
- admin can moderate (soft flags, removedAt), and Feature via highlights

### F) logs/{logId}
Read:
- if visibility == public => anyone
- else tenant members
- draft requires owner or admin

Write (strict):
Option 1 (recommended for competition integrity):
- clients can create Logs only as Draft
- clients can edit Draft content fields only
- publishing (draft->class/public), basePoints, dayKey/weekKey, and eligibility are performed by Cloud Function via Admin SDK
- clients cannot write basePoints/dayKey/weekKey/eligibleForPoints/featureBonusValue

Option 2 (less strict; not recommended if you care about cheating):
- clients can create class-visible logs directly
- rules attempt to validate dayKey from request.time (UTC-based only)
- easier, but weaker

This plan assumes Option 1.

### G) likes/{likeId}
Read:
- tenant members only (public pages do not need to read likes; they can display counts from aggregates)
Write:
- tenant member can create/remove their own Like doc only
- Like doc must contain only:
  - likerUserId (must equal request.auth.uid)
  - targetType, targetId
  - createdAt
No points fields.
Points are awarded via Cloud Function.

### H) comments/{commentId}
Read:
- tenant members
- public readers may read comments only for public targets (optional, but v1 CANON says public comments visible; implement carefully)
Write:
- tenant member can create comment with:
  - authorUserId == request.auth.uid
  - targetType, targetId, body, createdAt
- comment removal:
  - admin can set removedAt/removedBy
  - (optional) author can soft-delete their own comment

Points are awarded via Cloud Function using deterministic pointsEvents IDs.

### I) highlights/{highlightId}
Read:
- tenant members
Write:
- Pin:
  - student can create highlight.type == "pin"
  - only if targetOwnerUserId == request.auth.uid (pin your own work)
- Feature:
  - admin can create highlight.type == "feature"
  - requires categoryLabel
  - one-time bonus enforced in pointsEvents

### J) badgeDefs/{badgeId}
Read:
- tenant members
Write:
- admin only

### K) users/{userId}/badges/{badgeId}
Read:
- tenant members can read (for badge displays)
Write:
- system/admin only
- students cannot award themselves badges

### L) pointsEvents/{eventId}
Read:
- admin only (recommended)
- (optional) student can read their own points events for transparency, but never write
Write:
- system only (Cloud Function / Admin SDK)

### M) scoreboards/{boardId}/entries/{userId}
Read:
- tenant members (for leaderboards)
- public can read public leaderboard only if you explicitly want it (default: no)
Write:
- system only (Cloud Function / Admin SDK)

## 3) Cloud Functions responsibilities (required for integrity)

To keep competition real, the system must be the only scorer.

Recommended functions:

1) publishLog(tenantId, taskId, payload)
- validates: membership, task exists, required fields present
- computes dayKey/weekKey using tenant timezone
- enforces one log per task per day by deterministic logId
- writes canonical /logs/{logId} (or updates draft)
- sets basePoints from category pointsPerLog snapshot
- creates pointsEvents/log_award
- updates user points aggregates
- updates scoreboards
- awards certification badge if Office Hours task declares certificationBadgeId

2) onCreateLike
- validates target exists and is visible to liker
- computes socialUnit (base/10)
- enforces like caps per target
- creates pointsEvents/like_award
- updates aggregates + scoreboards

3) onCreateComment
- validates target exists and is visible
- enforces minimum length
- enforces first-per-target-per-day scoring via deterministic pointsEvents id
- creates pointsEvents/comment_award (to commenter)
- updates aggregates + scoreboards

4) onCreateFeature
- admin-only action
- applies featureBonus once per target
- creates pointsEvents/feature_award
- updates aggregates + scoreboards

5) onRemove/Moderation handlers
- if log deleted: remove log points + derived points (likes/comments/features) as policy dictates
- if comment removed: remove comment points event if it existed
- if like removed: remove like points event if it existed
- keep the audit trail consistent

## 4) Validation rules (what the client may never control)

Client must never be able to set or modify:
- role
- points totals
- pointsEvents
- scoreboards
- badges earnedAt/revokedAt
- log.basePoints
- log.dayKey/weekKey
- feature bonus values
- moderation fields (removedAt/removedBy) unless admin

## 5) Public read surface

Public viewers can read only:
- /publicProfiles/{userId} where publicEnabled == true
- /projects where visibility == "public"
- /logs where visibility == "public"

Optional:
- public comments on public targets
- public like/comment counts (via aggregates rather than raw docs)

Public viewers cannot read:
- Tasks
- Task Categories
- Leaderboards
- points totals
- tenant user roster

## 6) Minimum testing checklist (before students touch it)

Tenant isolation:
- cannot read/write across tenants

Visibility:
- draft not visible to other students
- class visible to tenant members only
- public visible without auth

Scoring integrity:
- cannot write pointsEvents from client
- cannot spoof basePoints/dayKey
- cannot create multiple scoring logs for same task/day
- like cap works
- comment “first per target/day” works
- feature bonus applies once

Moderation:
- admin can remove comments and points adjust correctly
- disabling publicEnabled hides portfolio publicly immediately
