# Quiz Page (`/quizzes/:id`) — Design Overrides

Inherits all rules from MASTER.md. Overrides and additions below.

## Layout

- Header: quiz info (difficulty badge, question count, session name)
- Scrollable list of questions
- Sticky bottom bar with submit button

## Question Card

- Numbered heading: "Question 1 of 10"
- Question text in body size, `--foreground` color
- Topic label as small muted badge above question text
- 4 answer options as radio cards (see MASTER.md Quiz Answer Options)
- Options stacked vertically, full-width
- Selected option: `--primary` left border accent + light blue bg tint
- Spacing: 16px between options, 32px between questions

## Progress Indicator

- Thin progress bar at top of page showing answered/total
- Color: `--primary`
- Updates as user selects answers

## Submit Bar

- Sticky bottom bar, white bg, top border
- "Submit Quiz" primary button, right-aligned (full-width on mobile)
- Disabled until all questions answered
- Shows count: "12 of 15 answered"

## Loading State (while AI generates)

- Skeleton cards mimicking question layout
- Pulsing animation on skeletons
- Text: "Generating your quiz..." centered above skeletons
