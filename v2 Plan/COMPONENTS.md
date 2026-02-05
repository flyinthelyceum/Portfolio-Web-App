# COMPONENTS.md
Portfolio Web App (Working Portfolio)
Version: v1 (draft)
Authority: CANON.md + LEXICON.md + IA_MAP.md + EMPTY_STATES.md

This file defines the UI building blocks and their required behaviors.
If components drift, fix the UI.

---

## 1) Global layout components

### AppShell
- top nav: Home / Tasks / Highlights / Leaderboard
- gear menu (buried): Preview Portfolio, Settings, Export (admin), Admin (admin)
- consistent spacing and typography
- no dashboard aesthetic

### Modal
Used for:
- Log Work
- Badge details
- Points breakdown
- Feature action (admin)

Rules:
- clear primary CTA
- one job per modal

---

## 2) Home (ID) components

### IDCard
Required:
- full name
- photo (optional)
- points summary (Total + small breakdown optional)
- badge grid (two unlabeled columns)
- streak summary (optional)

Behaviors:
- updates immediately after publishLog
- badge grid renders even when empty (intentional structure)

### BadgeGrid
Layout:
- two unlabeled columns
  - left column: Certifications
  - right column: Streaks
- shows badge icons/labels

Behavior:
- hierarchical streak badges replace previous level

### RecentLogStrip (optional v1)
- 3–5 recent Logs
- tap opens Log detail

---

## 3) Tasks components

### TaskList
- grouped by category
- shows points value (category pointsPerLog)
- shows “Logged Today” state
- optional “New” indicator

### TaskTile
Required:
- title
- category label
- points stamp (e.g., “+253”)
- status chip:
  - “Logged Today” / “Open” / “Closed” (if openAt/closeAt used)

### TaskDetail
Required:
- task content (video/text/resources)
- points stamp
- primary CTA: Log Work (disabled if logged today)
- secondary CTA when logged: Edit Today’s Log (no extra points)

Optional panels (v1.1):
- recent class logs for this Task
- your history for this Task

---

## 4) Log components

### LogWorkModal
Required fields:
- media (>=1)
- phase selector
- note text area

Visibility selector:
- Draft / Class / Public
Default: Class

Copy rules:
- if Draft selected: “Draft earns 0 points.”

Submit behavior:
- calls publishLog server action
- shows deterministic “Logged Today” result

### PhaseSelector
Fixed options:
- Sketch / Build / Test / Iteration / Reflection

### LogCard
Used in:
- Highlights
- optional recent logs strip
- project view

Shows:
- owner name
- preview media
- phase label
- points stamp optional (context dependent)
- like/comment affordances

---

## 5) Highlights components

### HighlightsFeed
- mixed items: Pins + Features
- Featured items visually marked with feature category label

### FeatureLabel
- required for Features
- optional for Pins

### SocialBar
- Like button + count
- Comment button + count
- comment composer (freeform)

Rules:
- no social UI on Draft
- moderation state hides removed comments

---

## 6) Leaderboard components

### LeaderboardViewSwitcher
Required views:
- Total (all time / week)
- Category (all time / week)
- Phase (all time / week)
- Social (all time / week)
- Feature (all time / week)

Copy rule:
- the header states what is being ranked

### LeaderboardRow
Shows:
- rank number
- student name
- score for current view

Optional:
- delta chip (“+371 today”) if available

---

## 7) Projects components

### ProjectCard
- cover media
- title
- owner name
- like/comment affordances
- visibility chip

### ProjectDetail
- project statement + tags
- list of linked Logs

---

## 8) Preview Portfolio components (buried)

### PublicPortfolioView
- reads only Public profile + Public Logs/Projects
- shows full name
- no Tasks, no leaderboards, no class-only

### PreviewPortfolioLink
- accessible only via gear/pro
