# RUNBOOK.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)
Authority: CANON.md

This is the operator manual for running the app during a school year.
It assumes competition is intentional and scoring is auditable.

## 1) Daily rhythm (operator)

Morning or before class:
- Check Tasks for “today”
- Publish any Tasks scheduled for the day
- Spot-check Highlights for anything that needs Feature placement
- Quick scan moderation queue (comments)

During class:
- Point students to a specific Task
- Remind: one Log per Task per day, so make it count
- Use Features as public recognition, not private feedback

After class:
- Feature 1–3 items if the wall needs energy
- Moderate anything that violates norms
- Export snapshot only if you need an incident record (otherwise weekly)

## 2) Weekly rhythm (operator)

Once per week (same day each week):
- Review leaderboard views:
  - Total Points (This Week)
  - By Category (This Week)
  - Social Points (This Week)
  - Feature Points (This Week)
- Feature cadence:
  - choose 1–2 Feature categories to emphasize (ex: Craft + Iteration)
- Audit scoring health:
  - look for point inflation via likes
  - look for comment spam patterns
- Publish next week’s Tasks (minimum viable schedule)

## 3) Task publishing cadence

Baseline (works in most courses):
- Office Hours: 1–3 per week (certifications live here)
- News: 2–5 per week (short, low friction)
- Project: 1–2 per unit (long arc prompts)
- Chore: 1–2 recurring (maintenance)
- Ritual: 1 recurring daily or near-daily

Rule:
- If students do not know what to do, the Tasks surface has failed.
- Keep Tasks fresh enough that “Log Work” feels purposeful.

## 4) Moderation playbook

Comment removal thresholds (v1):
- harassment, slurs, sexual content, threats
- targeted cruelty
- doxxing or personal info
- spam farming (low-effort repeated comments for points)
- anything that derails the studio

Actions:
1) Remove comment (soft remove)
2) If repeated, restrict user from commenting
3) If severe, deactivate user account and document incident

Policy:
- Removal also removes the associated comment points.
- Moderation actions are logged.

Suggested visible classroom norm:
- “Freeform comments are allowed. Be human. Be decent. Be brief.”

## 5) Scoring incident response

If a student says: “points are wrong”
- First: check whether the Log was Draft (draft earns 0)
- Check whether they already logged that Task today (one per task per day)
- Check if the Like/Comment was removed via moderation
- Check if the Feature bonus was applied already (one per target)

If a teacher says: “leaderboard feels off”
- Check social farming patterns:
  - too many likes on one item
  - comment spam
- If needed, tighten policy:
  - increase comment min length (still freeform)
  - restrict repeat offenders

Do not retroactively rescore categories.
Forward-only scoring changes only.

## 6) Category point edits

Allowed:
- editing pointsPerLog for a category to change future scoring

Not allowed:
- recalculating historical log basePoints because a category changed

Operational guideline:
- do category changes at unit boundaries if possible
- announce changes clearly (News task works well)

## 7) Certification operations (Office Hours)

Office Hours tasks can declare certificationBadgeId.
Certification is auto-awarded when:
- student completes an eligible Log (non-draft) for that Task

Teacher checklist:
- confirm the task is the correct Office Hours Task
- confirm the badge definition exists
- verify that the Log was Class/Public (not Draft)

Revocation:
- rare, but allowed
- use admin badge revoke tool and log reason

## 8) Feature operations

Features serve two roles:
- feed the Highlights wall
- award meaningful bonus points (base/2 once per target)

Use Features to:
- shape culture (what gets seen gets repeated)
- reward invisible excellence (iteration, restraint, craft)

Do not use Features to:
- punish
- correct
- settle disputes

Cadence:
- 1–3 features per class session is plenty
- spike Features when Highlights feels dead

## 9) Export cadence

Weekly export (recommended):
- end of week snapshot for audit safety
- supports incident response

End-of-unit export (recommended):
- archive the unit state

End-of-term export (required):
- final snapshot for records

Export contents should include:
- users, tasks, categories, logs, projects
- highlights, badges, pointsEvents, scoreboards

## 10) End-of-term archive

End of semester:
- disable new public publishing (optional)
- export final snapshot
- archive Tasks
- optionally create a “Yearbook Highlights” collection via Featured items
- preserve public portfolios if desired, or turn public off by policy

