# QuizGen Design System — Master

## Style

**Minimalism & Swiss Style** — Clean, functional, grid-based. Content clarity over decoration.

- Grid-based layout (12-column on desktop, single column on mobile)
- No unnecessary shadows or gradients
- Subtle borders for card separation
- Border-radius: 8px cards, 6px inputs/buttons
- Transitions: 150-200ms ease for hover/focus
- Performance: Excellent | Accessibility: WCAG AAA target

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#2563EB` | Primary actions, links, active states |
| `--on-primary` | `#FFFFFF` | Text on primary color |
| `--secondary` | `#7C3AED` | Secondary actions, tags |
| `--on-secondary` | `#FFFFFF` | Text on secondary color |
| `--accent` | `#F59E0B` | CTA highlights, scores, badges |
| `--on-accent` | `#0F172A` | Text on accent color |
| `--background` | `#EFF6FF` | Page background |
| `--foreground` | `#0F172A` | Primary text |
| `--card` | `#FFFFFF` | Card surfaces |
| `--card-foreground` | `#0F172A` | Card text |
| `--muted` | `#F1F5FD` | Disabled backgrounds, subtle fills |
| `--muted-foreground` | `#64748B` | Secondary text, placeholders |
| `--border` | `#E4ECFC` | Borders, dividers |
| `--destructive` | `#DC2626` | Errors, wrong answers |
| `--on-destructive` | `#FFFFFF` | Text on destructive |
| `--success` | `#16A34A` | Correct answers, success states |
| `--on-success` | `#FFFFFF` | Text on success |
| `--ring` | `#2563EB` | Focus ring color |

## Typography

**Font:** Inter (single family, weight variations)

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| H1 | 2rem (32px) | 700 | 1.2 |
| H2 | 1.5rem (24px) | 600 | 1.3 |
| H3 | 1.25rem (20px) | 600 | 1.4 |
| Body | 1rem (16px) | 400 | 1.5 |
| Body Small | 0.875rem (14px) | 400 | 1.5 |
| Label | 0.875rem (14px) | 500 | 1.4 |
| Caption | 0.75rem (12px) | 400 | 1.5 |

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

**Tailwind Config:**
```js
fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
```

## Spacing

8px base unit system: 4, 8, 12, 16, 24, 32, 48, 64

## Icons

Lucide React — consistent stroke width (1.5-2px), clean line style.

## Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | Single column |
| Tablet | 768px | 2-column where appropriate |
| Desktop | 1024px+ | Max-width container (1200px), centered |

## Component Patterns

### Cards
- White background, 1px `--border`, 8px radius
- Padding: 24px desktop, 16px mobile
- No shadow (flat style)

### Buttons
- Primary: `--primary` bg, white text, 6px radius
- Secondary: white bg, `--primary` text, 1px `--primary` border
- Destructive: `--destructive` bg, white text
- Height: 40px (desktop), 44px (mobile, touch target)
- `cursor-pointer`, hover opacity 0.9, transition 150ms

### Inputs
- White bg, 1px `--border`, 6px radius
- Height: 40px (desktop), 44px (mobile)
- Focus: 2px `--ring` outline
- Error: 1px `--destructive` border + error text below

### Quiz Answer Options (Radio Cards)
- Card-style radio buttons (full-width, clickable cards)
- Selected: 2px `--primary` border + light primary bg tint
- Correct (after submit): `--success` border + green bg tint
- Wrong (after submit): `--destructive` border + red bg tint
- Neutral (after submit, not selected): default style

## Interaction States

- Hover: subtle background change or opacity shift (150ms)
- Focus: 2px `--ring` outline offset
- Active/Pressed: slight scale (0.98) or darker shade
- Disabled: 0.5 opacity, `cursor-not-allowed`
- Loading: spinner icon or skeleton placeholder

## Anti-Patterns (Avoid)

- No emojis as icons — use Lucide SVGs
- No inconsistent border-radius values
- No raw hex in components — use design tokens
- No placeholder-only labels on form inputs
- No color-only meaning — always pair with icon/text
