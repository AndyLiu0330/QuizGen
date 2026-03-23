# History Page (`/history`) — Design Overrides

Inherits all rules from MASTER.md. Overrides and additions below.

## Layout

- Page heading "Quiz History"
- Filterable/sortable table or card list of all sessions

## Session List

- Card per session (on mobile) or table row (on desktop)
- Columns/fields: session name, material name, date, best score, weak topics
- Score display: colored percentage (green/amber/red thresholds per MASTER)
- Weak topics: comma-separated topic badges in muted style, max 3 shown with "+N more" overflow
- Click row/card to navigate to session config page
- Sort by: date (default, newest first), score, material name

## Empty State

- Centered muted text: "No quiz history yet"
- CTA button: "Upload a file to get started" linking to upload page

## Responsive Behavior

- Desktop (>=1024px): table layout with sortable column headers
- Mobile (<768px): card list, each card showing all fields stacked vertically
