# POINTS_MODEL.md

Points are momentum. Points are not grades.

## Category base points (v1)
- OFFICE HOURS: 253
- NEWS: 126
- PROJECT: 371
- CHORE: 184
- RITUAL: 213

Notes:
- pointsPerLog is set by the teacher when creating a Task.
- defaults above are used for initial Tasks in each category.
- values should live in the 100s, with non-round numbers encouraged.

## Earning rules
1) Drafts earn 0 points.
2) Published Log Work earns pointsPerLog for its Task.
3) Likes and comments earn ~1/10 of the log value.
4) Teacher Feature bonus earns 1/2 of the log value.

## Like points
- Awarded to: the owner of the liked Log Work
- Value: round(pointsPerLog / 10)
- Cap: per target per day, up to 1x pointsPerLog (prevents dogpiling inflation)

## Comment points
- Awarded to: the commenter (engager)
- Value: round(pointsPerLog / 10)
- Limit: first comment per target per day earns points (prevents spam)

## Feature points (teacher award)
- Awarded to: owner of featured Log Work
- Value: round(pointsPerLog / 2)
- Limit: once per Log Work

## One log per Task per day
If a student tries to publish a second Log Work on the same Task the same day:
- block publish, or
- convert to “revision of today’s log” (preferred)
