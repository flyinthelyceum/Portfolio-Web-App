# USER_FLOWS.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)
Authority: CANON.md + LEXICON.md + POINTS_MODEL.md + VISIBILITY_AND_ROLES.md

This document defines the canonical user flows.
If implementation drifts, fix implementation.

Legend:
- [UI] user action in interface
- [SYS] system action (server/Cloud Function)
- [STATE] state change

---

## Flow 1: First-run onboarding (student)

Goal: first Log in under 2 minutes.

1) [UI] Student opens app URL
2) [UI] Log in / Create account
3) [STATE] Home loads with ID card auto-populated
   - name present
   - points show 0
   - badges empty but laid out (two columns) so it looks intentional
4) [UI] Student taps Tasks tab
5) [UI] Student taps a visible Task (recommended: an Office Hours task)
6) [UI] Student taps “Log Work”
7) [UI] Student adds photo(s), selects Phase, writes short note
8) [UI] Student publishes to Class (default)
9) [SYS] publishLog() validates + writes canonical Log + awards points
10) [STATE] Home updates: points increase, streak begins
11) [STATE] If Office Hours task has a certificationBadgeId, certification badge appears

Success moment:
- points tick upward
- badge appears (if certification)
- “Logged Today” state appears on the Task

---

## Flow 2: View and complete a Task (daily ritual)

1) [UI] Student opens Tasks
2) [UI] Student selects a Task
3) [UI] Student consumes Task content (video/text/resources)
4) [UI] Student taps “Log Work”
5) [UI] Student uploads media + Phase + note
6) [UI] Student leaves visibility = Class (default)
7) [SYS] publishLog()
8) [STATE] Task switches to “Logged Today”
9) [STATE] points awarded and leaderboards update

Edge: student tries to log again on same task/day
- [UI] CTA disabled
- [UI] “Edit Today’s Log” is available
- [STATE] edits do not add points

---

## Flow 3: Draft → Publish (points-awarding boundary)

1) [UI] Student creates Log Work but chooses Draft
2) [STATE] Log exists, but earns 0 points
3) [UI] Student later opens Task → “Edit Today’s Log”
4) [UI] Student changes visibility to Class or Public
5) [SYS] publishLog() (or publishDraft()) awards base points once
6) [STATE] points appear and scoreboard updates

Rule:
- Drafts never earn points until published.

---

## Flow 4: Likes (points to owner)

1) [UI] Student views a Log or Project (in Highlights or within visibility)
2) [UI] Student taps Like
3) [SYS] onCreateLike validates visibility + awards like points to owner
4) [STATE] likeCount increments, owner points increment, leaderboards update

Constraints:
- one like per user per target counts for points
- like points for a single target are capped at the target base value

---

## Flow 5: Comments (points to commenter)

1) [UI] Student views a Log or Project
2) [UI] Student writes a freeform comment
3) [SYS] onCreateComment validates:
   - visibility
   - min length
   - first-per-target-per-day scoring uniqueness
4) [STATE] commentCount increments
5) [STATE] commenter receives comment points (socialUnit), leaderboards update

Constraints:
- only the first comment per commenter per target per day awards points

---

## Flow 6: Pin to Highlights (student)

1) [UI] Student opens their own Log/Project
2) [UI] Student taps “Pin”
3) [SYS] creates highlight(type="pin") if allowed
4) [STATE] item appears in Highlights feed

Rule:
- students can only pin their own work

---

## Flow 7: Feature (teacher) + bonus points

1) [UI] Admin opens a Log/Project
2) [UI] Admin taps “Feature”
3) [UI] Admin selects a Feature category label
4) [SYS] creates highlight(type="feature")
5) [SYS] awards feature bonus points (base/2) once per target
6) [STATE] item appears in Highlights with label
7) [STATE] owner’s points increase and leaderboards update

Constraints:
- one feature bonus per Log/Project in v1

---

## Flow 8: Earn certification badge (auto-award)

1) [UI] Student completes an Office Hours Task and logs eligible work (non-draft)
2) [SYS] publishLog detects tasks.certificationBadgeId
3) [SYS] awards badge to user (system)
4) [STATE] badge appears on Home ID card under Certifications column

---

## Flow 9: Preview Portfolio (buried)

1) [UI] Student opens gear menu
2) [UI] Select “Preview Portfolio”
3) [STATE] Preview shows only Public content
4) [UI] Student toggles a Project/Log to Public (if allowed)
5) [STATE] preview updates to include it

Constraint:
- Preview never displays Draft or Class-only items.

---

## Flow 10: Public viewing (unauthenticated)

1) [UI] Viewer opens a public portfolio URL
2) [SYS] loads public profile + public Logs/Projects only
3) [UI] Viewer sees full name + public work

No access to:
- Tasks
- Leaderboards
- Class-only content
- Drafts

---

## Flow 11: Moderation (teacher)

Comment removal:
1) [UI] Admin removes a comment
2) [SYS] sets removedAt/removedBy, removes comment points if awarded
3) [STATE] comment disappears for users; leaderboards update accordingly

Restrict user:
1) [UI] Admin toggles “canComment” false (or similar)
2) [STATE] user cannot comment; likes optional policy

---

## Flow 12: Export (admin)

1) [UI] Admin → Exports
2) [SYS] generate export bundle:
   - users, tasks, categories, logs, projects, highlights, badges, pointsEvents, scoreboards
3) [STATE] downloadable artifact available (admin-only)

