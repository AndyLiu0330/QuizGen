# Results Page (`/quizzes/:id/results`) — Design Overrides

Inherits all rules from MASTER.md. Overrides and additions below.

## Layout

- Score summary card (top)
- Weak topics section (if any)
- Question-by-question review list
- Action buttons at bottom

## Score Summary Card

- Centered, prominent display
- Large score percentage (H1 size, bold)
- Fraction below: "8 out of 10 correct"
- Score color: `--success` (>=70%), `--accent` (40-69%), `--destructive` (<40%)
- Circular progress ring around the percentage (optional enhancement)

## Weak Topics Section

- Only shown if there are topics with <50% accuracy
- Card with heading "Areas to Improve"
- List of weak topic names with their accuracy percentage
- Each shown as a row: topic name + small bar chart or percentage

## Question Review List

- Each question shown as a card
- Topic badge (muted) at top
- Question text
- All 4 options shown:
  - User's answer marked with a dot/icon
  - Correct answer: green bg tint + check icon (Lucide `Check`)
  - Wrong answer (if user selected): red bg tint + X icon (Lucide `X`)
  - Other options: default muted style
- No interaction (read-only review)

## Action Buttons

- "Retake Same Quiz" secondary button
- "Generate New Quiz" primary button
- "Back to Session" text link
- Buttons side by side on desktop, stacked on mobile
