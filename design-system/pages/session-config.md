# Session Config Page (`/sessions/:id`) — Design Overrides

Inherits all rules from MASTER.md. Overrides and additions below.

## Layout

- Material info header (file name, type, upload date)
- Quiz configuration form card
- Previous quizzes list below

## Quiz Configuration Form

- Card with heading "Generate New Quiz"
- Number of questions: segmented control (5 / 10 / 15 / 20) — pill-style toggle group
- Difficulty: segmented control (Easy / Medium / Hard) with color hints:
  - Easy: default style
  - Medium: `--accent` tint
  - Hard: `--destructive` light tint
- "Generate Quiz" primary button, full-width on mobile
- Loading state: button shows spinner + "Generating..." while AI works

## Previous Quizzes List

- Card per quiz: quiz number, difficulty badge, score (if completed), date
- Score display: percentage + fraction (e.g., "80% — 8/10")
- Score color: green (>=70%), amber (40-69%), red (<40%)
- Incomplete quizzes show "In Progress" badge in muted style
- Click to navigate to quiz or results page
- Empty state: "No quizzes yet — generate your first one above"
