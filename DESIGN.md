# Design System Strategy: The Academic Noir

This design system is a bespoke visual framework crafted for high-end digital learning. It moves beyond standard "SaaS aesthetics" to create an environment that feels like a prestigious digital library. By pairing scholarly serif typography with a cutting-edge dark-mode architecture, we position the user not just as a "student," but as a serious curator of knowledge.

## 1. Creative North Star: The Digital Curator
The "Digital Curator" philosophy treats every quiz and question as a valuable artifact. The interface avoids the "clutter" of traditional educational software in favor of an editorial, high-contrast experience. We use deep charcoals and teal accents to create a space that is intellectually stimulating yet calming.

This system rejects rigid, boxed-in layouts. Instead, it utilizes **intentional asymmetry** and **tonal depth** to guide the eye. We prioritize "dark space"—the dark mode equivalent of white space—to ensure that the scholarly typography has the room it needs to command authority.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of deep charcoals and muted teals. We avoid pure blacks (#000000) except for the absolute lowest layer to prevent visual crushing and maintain a sophisticated "ink on dark paper" feel.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section off major UI areas.
Boundaries must be defined solely through background color shifts. For example, a card (using `surface-container-low`) should sit on the global `background` without a stroke. The contrast between the two hex codes provides a softer, more premium transition than a harsh line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to create natural depth:
- **Level 0 (Base):** `surface` (#0e0e0e) for the main canvas.
- **Level 1 (Sections):** `surface-container-low` (#131313) for large groupings or content areas.
- **Level 2 (Cards):** `surface-container` (#191a1a) for quiz questions and interactive blocks.
- **Level 3 (Interactive):** `surface-container-high` (#1f2020) for active or hovered elements.

### The Glass & Gradient Rule
To inject "soul" into the interface, use **Glassmorphism** for floating elements (like tooltips or navigation bars).
- **Glass Spec:** Use `surface-variant` at 60% opacity with a 20px `backdrop-blur`.
- **Signature Gradient:** For primary CTAs, use a subtle linear gradient from `primary` (#83d3db) to `primary_dim` (#75c5cd) at a 135-degree angle. This prevents the "flat" look and adds a cutting-edge shimmer.

---

## 3. Typography
The typography scale relies on the tension between a sophisticated serif and a utilitarian sans-serif.

- **Display & Headlines (Newsreader):** Used for titles and headers. The serif conveys reliability and scholarly tradition. Use `display-lg` (3.5rem) for hero titles to establish an editorial feel.
- **Body & Labels (Inter):** Used for questions, answers, and data. The high legibility of Inter ensures that even long quiz descriptions are easy on the eyes.
- **Hierarchy Hint:** Always pair a `headline-md` serif question with a `body-md` sans-serif description. This contrast signals the difference between the "inquiry" and the "instruction."

---

## 4. Elevation & Depth
In this system, elevation is an optical illusion created by light and tone, not just drop shadows.

### Tonal Layering
Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` section creates a "sunken" effect, perfect for input fields. Conversely, a `primary-container` button on a `surface` background creates a natural lift.

### Ambient Shadows
If a floating effect is required (e.g., a modal or a floating action button):
- **Blur:** Minimum 32px.
- **Opacity:** 4% to 8%.
- **Tint:** The shadow should not be black; it should be a dark-tinted version of the `primary` color (#00484c) to simulate the glow of the accent color in a dark room.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in a high-glare environment), use the **Ghost Border**: `outline-variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (Primary to Primary-Dim), `on-primary` text, `xl` (1.5rem) corner radius. No border.
- **Secondary:** `surface-container-high` fill with a `Ghost Border`.
- **Interactive State:** On hover, increase the opacity of the gradient or shift the background one tier higher in the surface scale.

### Quiz Cards & Lists
- **Rule:** Forbid divider lines. Use `spacing-6` (2rem) of vertical "dark space" to separate questions.
- **Answers:** Use `surface-container` for the default state. Upon selection, transition the background to `primary-container` and the text to `on-primary-container`.
- **Corner Radius:** All interactive containers must use `lg` (1rem) or `xl` (1.5rem) rounding to soften the "intellectual" tone and make it feel approachable.

### Input Fields
- **Style:** "Sunken" appearance using `surface-container-lowest` background.
- **Active State:** A 2px bottom-only border using the `primary` teal. This mimics the look of a premium notebook or high-end stationary.

### Progress Indicators (App-Specific)
- **The Modern Gauge:** Instead of a thick bar, use a slim `px` height line in `outline-variant`, with the active progress in `primary`. Ensure it spans the full width of the container to emphasize the horizontal "journey" of the quiz.

---

## 6. Do’s and Don’ts

### Do
- **Do** embrace asymmetry. Center-aligning everything is for templates. Use left-aligned headlines with right-aligned metadata for a custom feel.
- **Do** use `tertiary-container` (#d1f3de) for success states. It is a softer, more "intellectual" green than a standard neon success color.
- **Do** use the `spacing-20` (7rem) or `spacing-24` (8.5rem) for top-level padding to give the UI an expansive, premium atmosphere.

### Don't
- **Don't** use standard "drop shadows" (0, 4, 10, 0). They feel cheap. Use the Ambient Shadow spec.
- **Don't** use 1px dividers. If you feel the need for a line, try using a background color shift or more whitespace instead.
- **Don't** use the serif font for small labels or buttons. The serif is for "reading"; the sans-serif is for "doing." Keep `label-sm` and `title-sm` strictly in Inter.