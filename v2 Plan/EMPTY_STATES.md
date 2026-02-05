# EMPTY_STATES.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)
Authority: CANON.md + LEXICON.md + IA_MAP.md

Empty states are not filler.
They teach the system’s grammar.
They should feel intentional, not apologetic.

Rules:
- one instruction per sentence
- concrete verbs
- no motivational fog
- no “nothing here yet” sadness
- always provide a next action
- default tone: calm, direct, studio-tool

---

## 1) Global

### A) No network / failed load
Headline: “Couldn’t load.”
Body: “Check your connection and try again.”
Primary: “Retry”

### B) Permission / not allowed
Headline: “Not available.”
Body: “You don’t have access to that.”
Primary: “Go back”

### C) Deleted / removed target
Headline: “This is gone.”
Body: “It may have been deleted or removed.”
Primary: “Back to Highlights”

---

## 2) Home (ID)

### A) New user: zero points, no logs
Show the ID card anyway (always).
Below the card:

Headline: “Start with one Task.”
Body: “Select a Task. Then Log Work.”
Primary: “Go to Tasks”

### B) No badges earned yet
Badges grid still renders (two columns, empty slots allowed).
Microcopy under grid:

Body: “Certifications are earned in Office Hours. Streaks begin after your first Log.”

### C) Public disabled (if shown)
Body: “Public is off.”
Secondary: “Preview Portfolio” (still buried)

---

## 3) Tasks index (Tasks tab)

### A) No Tasks published
Headline: “No Tasks yet.”
Body: “Check back soon.”
(Students have no creation action here.)

Admin-only addendum (visible only to admin):
Primary: “Create a Task”

### B) Category exists but has no Tasks
Show category header with a clean, empty block.

Body: “No Tasks in this category.”
(Do not suggest alternatives, keep it restrained.)

---

## 4) Task detail

### A) No eligible logging today (already logged)
Headline: “Logged Today.”
Body: “Edits won’t add points.”
Primary: “Edit Today’s Log”
Secondary: “Back to Tasks”

### B) Task is Draft/Unavailable (student)
Headline: “Not available.”
Body: “This Task isn’t published.”
Primary: “Back to Tasks”

### C) Upload required (before submit)
Inline validation, not a separate empty state:
- “Add at least one photo.”
- “Select a Phase.”
- “Write a short note.”

---

## 5) Log creation modal (Log Work)

### A) No media added
Headline: “Add photos.”
Body: “Proof first.”
Primary: “Add Photos”

### B) Phase not selected
Inline:
“Select a Phase.”

### C) Note empty
Inline:
“Say what changed.”

### D) Draft selected
Inline:
“Draft earns 0 points.”

---

## 6) Highlights

Highlights must never feel dead.
Default posture:
- always show Featured items first if any exist
- otherwise show Pins

### A) Truly empty Highlights feed (rare; early term)
Headline: “Nothing featured yet.”
Body: “Pin your work to start the wall.”
Primary: “Go to Tasks”

Secondary:
“Pin lives on your Log after you Log Work.”

### B) Filter returns no results
Headline: “No matches.”
Body: “Change the filter.”
Primary: “Clear filter”

---

## 7) Leaderboard

Leaderboards should never show “empty.”
If scores are truly zero, show structure anyway.

### A) All scores are zero (first day)
Show ranked list with all students at 0.
No empty state.

Optional microcopy at top:
Body: “Points start when you Log Work.”

### B) Filter returns no results (edge case)
Headline: “No results.”
Body: “Change the view.”
Primary: “Back to Total Points”

---

## 8) Projects (if student opens Projects section or modal)

### A) No Projects yet
Headline: “No Projects yet.”
Body: “Projects are optional. Start by logging Tasks.”
Primary: “Go to Tasks”

Secondary:
“Create Project” (optional, if you allow projects creation from this screen)

---

## 9) Preview Portfolio (buried)

### A) Public disabled
Headline: “Public is off.”
Body: “Enable Public to share your portfolio.”
Primary: “Enable Public” (if student is allowed)
Secondary: “Back”

If public toggling is admin-controlled:
Body: “Ask your teacher to enable Public.”

### B) Public enabled but no public work
Headline: “No public work yet.”
Body: “Set a Log or Project to Public.”
Primary: “Back to Tasks”

### C) Public enabled with work
No empty state.

---

## 10) Social (Likes / Comments)

### A) Comments disabled for user (restricted)
Headline: “Comments are off.”
Body: “You can still Like.”
Primary: “OK”

### B) Draft content
No social UI visible. No empty state.

---

## 11) Admin empty states

### A) No Task Categories (admin)
Headline: “Create categories first.”
Body: “Tasks inherit points from categories.”
Primary: “Create Category”

### B) No badge definitions
Headline: “No badges yet.”
Body: “Add Certifications and Streak levels.”
Primary: “Create Badges”

### C) No exports yet
Headline: “Nothing exported.”
Body: “Exports generate a full snapshot.”
Primary: “Create Export”

