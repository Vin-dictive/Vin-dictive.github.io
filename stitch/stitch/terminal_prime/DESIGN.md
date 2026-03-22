```markdown
# Design System Strategy: The Monolith & The Pulse

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Monolith."** 

This system moves away from the "generic developer template" by treating the UI as a series of high-density data clusters floating within a vast, architectural void. It balances the cold, structural authority of deep charcoal and crisp white with the aggressive, energetic pulse of vibrant red and warm orange accents. 

To break the "template" look, we employ **Intentional Asymmetry**. Large-scale `display-lg` typography should offset smaller, high-density monospace `label-md` technical data. Elements should overlap—a terminal-style code block should "bite" into a headline, or a project image should bleed off the edge of its `surface-container`, creating a sense of scale that exceeds the viewport.

---

## 2. Colors & Surface Philosophy
The palette is built on extreme contrast to mirror the binary nature of code. 

### Surface Hierarchy & Nesting
We reject the flat grid. Depth is achieved through a "Russian Doll" nesting strategy using the `surface-container` tiers.
- **The Base:** Always start with `surface` (#0e0e0e).
- **The Section:** Use `surface-container-low` (#131313) to define broad content areas.
- **The Component:** Use `surface-container-high` (#20201f) or `highest` (#262626) for cards or code editors.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the separation the human eye needs. Lines create visual noise; tonal shifts create atmosphere.

### Signature Textures
- **The Pulse Gradient:** For primary CTAs and hero highlights, utilize a linear gradient from `primary` (#ff8e83) to `primary-container` (#ff766b). This adds a "glow" effect that mimics a high-end mechanical keyboard or server rack indicator.
- **Glassmorphism:** Floating navigation bars or modal overlays must use `surface-container-highest` at 80% opacity with a `backdrop-blur` of 20px. This ensures the high-contrast background "bleeds" through, maintaining the dark-mode immersion.

---

### 3. Typography: Editorial Technicality
The type system pairs the humanistic weight of **Inter** with the structural precision of **Space Grotesk** (Monospace).

*   **Display & Headlines (Inter Bold):** These are the "Monoliths." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to command attention. They should feel heavy, permanent, and unmovable.
*   **Technical Details (Space Grotesk):** Use `label-md` and `label-sm` for all metadata, Git hashes, tech stacks, and timestamps. This reinforces the "Developer" persona through a clean, monospace aesthetic.
*   **Body (Inter Regular):** `body-lg` (1rem) provides high readability against the dark charcoal background. Keep line-height generous (1.6) to prevent "vibration" in high-contrast settings.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "organic" for this tech-focused system. We use **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a "recessed" look, or a `surface-container-highest` card on `surface` for a "protruding" look.
*   **Ambient Shadows:** If an element must float (e.g., a dropdown), use a shadow tinted with `surface-tint`.
    *   *Spec:* `0px 20px 40px rgba(0, 0, 0, 0.4)`. The shadow color must never be pure black; it should be a deep, transparent version of the background.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token at **15% opacity**. It should be a suggestion of a boundary, not a hard line.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` background with `on-primary` text. Use `rounded-sm` (0.125rem) for a sharp, architectural feel. No gradients here—just a pure "pulse" of color.
*   **Secondary:** No background. Use a "Ghost Border" (15% `outline`) and `primary` text. On hover, transition the background to `surface-container-high`.

### Input Fields
*   **Styling:** Use `surface-container-highest` as the base. 
*   **The Focus State:** Do not use a glow. Change the bottom border to `primary` (2px) and shift the background color slightly lighter.
*   **Monospace Labels:** All labels must use `label-md` (Space Grotesk) in `on-surface-variant`.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Layout:** Separate list items using `spacing-4` (1rem) of vertical white space. 
*   **Hover State:** Upon hovering a list item or card, shift its background from `surface` to `surface-container-low`. It should feel like a light being turned on behind a pane of glass.

### Terminal/Code Blocks
*   **Base:** `surface-container-lowest` (#000000).
*   **Accents:** Use `tertiary` (#d29dff) for syntax highlighting to provide a sophisticated "cyberpunk" secondary tone that complements the red accents.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme scale. Pair a `display-lg` headline with a `label-sm` technical note immediately adjacent to it.
*   **Do** embrace the void. Use `spacing-24` (6rem) between major sections to let the "Monoliths" breathe.
*   **Do** use `primary` (#E53935) sparingly. It is a "warning" or "action" color; overusing it dilutes its impact.

### Don't:
*   **Don't** use `rounded-full` for anything other than status indicators. This system is architectural; use `rounded-sm` or `none`.
*   **Don't** use 100% white (#ffffff) for long-form body text in dark mode. Use `on-surface-variant` (#adaaaa) to reduce eye strain.
*   **Don't** use standard "box-shadow" presets. If an element doesn't feel separated enough, increase the tonal shift of the `surface-container` instead.

---

## 7. Developer Portfolio Specifics
*   **The "Commit" Feed:** Use a vertical timeline where the "line" is actually a `spacing-px` gap between `surface-container` blocks. 
*   **Language Chips:** Use `surface-container-highest` with `label-sm` text. Use a tiny 4px circle of `secondary` (#fd7e93) next to the text to indicate "live" expertise.
*   **Project Hero:** Overlap the project title (`display-md`) across the boundary of the project image and the background to create a 3D layered effect.```