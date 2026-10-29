# Implementation plan: a 3D "round room" view for the portfolio

> **For the agent executing this plan.** You have the repo but none of the conversation that produced this
> document. Everything you need is below — reference analysis, codebase facts, verified dependency
> versions, settled decisions, and a staged build order. Facts marked **verified** were checked against
> the actual repo or the npm registry; treat them as true. Facts marked **assumption** or **confirm
> empirically** are mine and may be wrong.
>
> **Before writing any code, read `node_modules/next/dist/docs/`.** `AGENTS.md` at the repo root mandates
> this, and it is not boilerplate: this is Next.js 16, which has breaking changes relative to most
> training data. The two constraints in §3 below were verified firsthand and are the kind of thing a
> model confidently gets wrong from memory.

---

## 1. What is being built, and why

The portfolio at `/` is a six-slide vertical scroll site. The goal is a **second way to experience the
same content**: a full-bleed WebGL canvas where you stand at the centre of a cylindrical room with the
content wrapped around the inside wall, and turn it horizontally to navigate.

The scroll site **remains the default and remains untouched**. The room is an alternative view at
`/room/`, reached by a toggle.

### The reference: justinmaller.com

The design being emulated. What it actually is, from reading its shipped source:

- **One full-bleed WebGL2 stage.** Two stacked canvases (`#g`, `#h`) filling the viewport; `body` has
  `overflow: hidden`. There is no scrolling anywhere in the experience.
- **A round room.** Artwork hangs on the inside of a cylinder; the camera sits at the centre. Its own
  `aria-label` describes it as *"Justin Maller's work on the inside of a round room. Drag or scroll to
  turn; open a project to see its pieces all the way round."*
- **Yaw-only navigation.** Drag or scroll turns the room. `←`/`→` step between items.
- **Ring drill-down.** Opening a project re-forms the wall as a ring of that project's own pieces.
  `↑ All work` (bottom-left) returns to the top level; `← →` sit bottom-right.
- **A thin 64px translucent bar** on top: wordmark left, nav (`Work` / `Projects` / `Info`) centre-left,
  a segmented view control (`Room` / `Code`) right. Notably, on desktop the production CSS sets the
  bar's background to `none` and the wordmark to `color: transparent`, so only the room reads — the
  wordmark is drawn *in* the 3D scene, not in the DOM.
- **Palette** `--ground: #04060a`, `--accent: #9fd4ff`, `--fg: #e3eefa`. A `.code` variant shifts the
  accent to violet `#b48cff`. A `.paper` light variant exists in the CSS but is unused ("no room uses
  it now").
- **Type** `Big Shoulders Display` 700 at `.03em` for the wordmark; `Martian Mono` at **10px / .16em
  uppercase** for every label. Those label metrics are the single most transferable detail in the whole
  design.
- **Scale.** ~700 KB of hand-written JS/GLSL across `room.js` (59 KB), `room-data.js` (9 KB),
  `jm-glass.js` (95 KB), `jm-shapes.js` (36 KB) and `jm-precog.js` (470 KB). The last file's own header
  describes four raymarched room environments, each "traced per pixel by its own shader and lit only by
  the work, through a light map built from the pieces every frame", finished with "bloom, streaks, focus
  pull, vignette, colour split, grain, dither".

### What this plan deliberately does **not** reproduce

State this plainly if asked; do not quietly attempt it.

- **The raymarched room environments.** Four per-pixel-traced environments are the bulk of that 470 KB.
- **The artwork-driven light map.** Rebuilding a light map from the wall contents every frame.
- **Streaks and dither** from the post chain.

The reasoning: those techniques exist to make *large artwork* sing. This portfolio's room contains
**typography and logos**, not artwork (see §2 — the gallery photos are deliberately excluded). Spending
the effort there would solve a problem this content does not have. The effort goes into text legibility
instead.

---

## 2. Settled decisions — do not relitigate these

These were decided with the repo owner. If you disagree with one, say so, then implement it anyway.

| Decision | Value |
|---|---|
| **Default view** | The existing scroll site at `/`. Stays default, stays untouched. |
| **Room location** | Its own route `/room/`, reached by a `[ Page \| Room ]` toggle in the existing nav. |
| **Navigation** | Horizontal — drag + wheel (`deltaX` *and* `deltaY`) + `←`/`→` + touch, all feeding one yaw angle with inertia and snap-to-panel. |
| **Skin** | **Dual**, driven by the site's existing ThemeToggle. Dark ground `#0e0e0e`; light ground `#faf8f6`; coral accent in both. |
| **Wall content** | 12 Projects, 4 Experience + 2 Education, About + Contact. **Gallery photos are excluded.** |
| **Drill-down** | **Ring drill-down** — clicking an item re-forms the wall as a ring of that item's own facets. Not a DOM modal, not a camera dolly. |

Two consequences worth internalising:

1. **Excluding the photos makes this a typography problem.** The reference hangs large artwork, which
   forgives curvature, glancing angles and soft sampling. Type forgives none of it. This is why §5 is
   the longest section in this document and where most of the risk lives.
2. **The dual skin costs a full texture repaint on every theme flip**, because panel text and
   backgrounds are baked into canvas textures. See §8 for the mitigation. A single fixed skin would
   have been materially cheaper; the owner chose consistency with the existing toggle, knowing this.

---

## 3. The codebase, as it actually is

All **verified**. Paths are repo-relative.

### Stack

- **Next.js 16.3.5**, App Router. `next.config.js`: `output: 'export'`, `trailingSlash: true`,
  `images.unoptimized: true`, `experimental.useTypeScriptCli: true`.
- **React 19.3**, **TypeScript 7**.
- **Tailwind v4** via `@tailwindcss/postcss`, but with a **v3-style `tailwind.config.js` re-attached**
  through `@config "../tailwind.config.js"` at the top of `app/globals.css`. Do not assume v4
  CSS-first config conventions.
- **Yarn 1.22.22**. CI runs `yarn install --frozen-lockfile`.

### Two Next 16 constraints, confirmed firsthand

1. **`ssr: false` is not supported in Server Components.**
   `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:94-95` — *"`ssr: false` is not allowed
   with `next/dynamic` in Server Components. Please move it into a Client Component."* This is why the
   plan mandates an intermediate client wrapper (§4) rather than calling `dynamic()` in `page.tsx`.
2. **Client Components are still prerendered to HTML at build time.**
   `node_modules/next/dist/docs/01-app/02-guides/static-exports.md:259` — so `window`, `navigator` and
   WebGL context creation must be inside `useEffect`, never in a component body.

Other relevant bundled docs: `01-app/02-guides/single-page-applications.md:207-217` (the canonical
browser-only dynamic-import pattern), `01-app/03-api-reference/01-directives/use-client.md`,
`01-app/02-guides/package-bundling.md`, `01-app/03-api-reference/05-config/01-next-config-js/turbopack.md`.

### Design tokens

`app/globals.css:98-133`. Folio tokens are **space-separated RGB triplets**, consumed as
`rgb(var(--folio-x) / <alpha-value>)` (wired in `tailwind.config.js:23-39`). You will need to parse them
in JS — `CursorDotBackground.tsx:5-14` already has the parser to copy.

| Token | Dark | Light |
|---|---|---|
| `--folio-surface` | `14 14 14` | `252 250 248` |
| `--folio-surface-highest` | `38 38 38` | `224 221 216` |
| `--folio-on-surface` | `255 255 255` | `28 27 26` |
| `--folio-on-surface-variant` | `173 170 170` | `92 88 84` |
| `--folio-primary` | `255 142 131` | `255 142 131` |
| `--folio-secondary` | `253 126 147` | `230 90 120` |
| `--folio-outline-variant` | `72 72 71` | `200 196 192` |

A second, legacy shadcn HSL palette coexists at `app/globals.css:136-179`. Ignore it.

### Fonts

`app/layout.tsx:8-18` declares `Inter` → `--font-inter` and `Space_Grotesk` → `--font-space-grotesk` via
`next/font/google`.

**Verified, and load-bearing for §5:** these variables resolve to **plain readable family names**, not
hashed ones:

```
--font-inter: "Inter", "Inter Fallback"
--font-space-grotesk: "Space Grotesk", "Space Grotesk Fallback"
```

So a Canvas2D painter can read the variable and drop it straight into `ctx.font`. This is why the
canvas-texture approach is viable here.

### Theme — lives in the DOM, not React

`components/ThemeToggle.tsx` exports a **named** `ThemeToggleButton` (not a default). Its state source of
truth is the DOM itself:

- `subscribe` = a `MutationObserver` on `document.documentElement` filtered to `["class"]` (`:7-12`)
- `getSnapshot` = `document.documentElement.classList.contains("dark")` (`:14-16`)
- `getServerSnapshot` = `true`, matching the dark-by-default prerender (`:19-21`)
- wired with `useSyncExternalStore` (`:28`)
- toggling mutates the `dark` class directly and writes `localStorage.theme` (`:30-39`)

**There is no theme React context.** `app/layout.tsx:31-41` has a `beforeInteractive` script that applies
the class pre-hydration; `<html>` ships with `className="dark scroll-smooth"` and
`suppressHydrationWarning`. Dark is the hard default — there is no `prefers-color-scheme` detection
anywhere.

### Existing canvas work

`components/CursorDotBackground.tsx` is the reference implementation to match. Mounted in
`app/layout.tsx:58` at `z-0`; page content sits at `z-[1]`, nav at `z-50`, lightbox at `z-[100]`.

- DPR: `Math.min(devicePixelRatio || 1, 2)`, sets `width`/`height` in device px, `style.width`/`height`
  in CSS px, then `setTransform(dpr,0,0,dpr,0,0)` (`:51-61`).
- Re-reads CSS custom properties **every frame** (`:36-49`, called at `:96`), so theme flips need no
  extra wiring.
- `prefers-reduced-motion` **degrades** — zeroes displacement and pins the glow — but the rAF loop keeps
  running (`:32-34`, `:86-88`, `:95`).
- **It paints an opaque `--folio-surface` fill over the entire viewport** (`:113-114`). This matters: see
  §4.
- No `visibilitychange` guard exists anywhere in this repo.

### Navigation

`components/Navigation.tsx`, `"use client"`, `z-50`, a fixed floating glass pill. No hamburger — the icon
row is a horizontally-scrollable overflow strip on mobile.

- Takes `resumeUrl` as a prop. Nav model is `readonly NavItem[]` with `kind: "hash" | "route"` (`:28-36`);
  hash ids `home | about | experience | projects | certifications | contact`, plus `gallery` as
  `kind: "route"` → `/gallery/`.
- **Scroll-spy is manual, not IntersectionObserver** (`:101-126`): walks the hash items comparing
  `getBoundingClientRect().top <= probe`. The probe reads `scrollPaddingTop` and falls back to a
  hardcoded `112` (`:91-95`) — and nothing in the repo actually sets `scroll-padding-top`, so the
  fallback is always what runs.
- **It rewrites `location.hash` via `history.replaceState` on every scroll** (`:115-125`), with a 750 ms
  `hashNavLockRef` during anchor jumps (`:137-154`).

> **Therefore: room state must not live in the URL hash.** Scroll-spy already owns it and will fight you.

Reusable style constants: `navLinkBase` / `navLinkInactive` / `navLinkActive` / `navActionPill` at
`:58-68`. `ThemeToggleButton` sits in the right-hand action cluster at `:230-243`.

### Shared primitives actually in use

- `lib/utils.ts` — exports only `cn(...) = twMerge(clsx(inputs))`.
- `components/sections/sectionGlass.ts` — the canonical glass recipe: `sectionGlassShell`,
  `sectionGlassCard`, `sectionGlassCardStatic`.
- `components/sections/folioLayout.ts` — `folioContainerClass`, `folioSectionXPad`.
- CSS component classes in `app/globals.css:4-95`: `.folio-slide`, `.hscroll`, `.technical-label`,
  `.kinetic-monolith`, `.pulse-gradient`, `.parallax-fade`, `.logo-icon`, `.nav-link-active`.

### Dead code — do not use as a template

- `components/FluidBackground.tsx` — unreferenced, **and it leaks**: the rAF handle is never captured, so
  the loop is never cancelled on unmount. No DPR scaling, no reduced-motion handling, hardcoded colours.
- `components/ui/card.tsx`, `components/ui/tabs.tsx` — imported by nothing.
- `SkillsBentoSection`'s `variant="page"` branch — unreachable.
- `@radix-ui/react-slot`, `class-variance-authority` — installed, zero references.

framer-motion `^13.2.0` is used in **exactly one file**: `components/ParallaxBackground.tsx`.

### Data

`data/profile.json`:

```
personal { name, quote, slogans[7], location, email, github, linkedin, website, resumeUrl, about }
skills   { programmingLanguages[7], frameworks[15], dataScience[11], cloudDevOps[16] }
experience[4]     { title, company, duration, location, description, techStack (CSV string), logo, link }
projects[12]      { name, description, link, preview }      // `preview` is never rendered anywhere
education[2]      { degree, institution, duration, details, grade, logo, link }
certifications[8] { name, organization, year, details, logo, link }
pictures[23]      { src, alt, caption, location }           // excluded from the room
```

**Measured against the texture budget (verified):**

- Longest project description is **209 characters** — three clamped lines at panel size. The 512 × 640
  rest tier in §5 is sufficient, not optimistic.
- All six Journey logos resolve under `public/`: `tailscale.svg`, `ubc.svg`,
  `bluerabbit-logo-white.svg`, `oracle.svg`, `ubc.svg` (again), `ait.svg`.
- **`ubc.svg` appears twice** — once as employment (Jan–Aug 2026) and once as the degree (2025–2026).
  Both panels are correct; distinguish them by role text, not by logo.
- `personal.about` is two paragraphs — fits the Info station without scrolling.
- `bluerabbit-logo-white.svg` is **white on transparent** and would vanish in the light skin. §5 handles
  this.

### Build & deploy

`.github/workflows/nextjs.yml` — push to `main`, node 24, `yarn install --frozen-lockfile`, `yarn build`,
uploads **`./out`** via `actions/upload-pages-artifact@v4`.

**No `basePath`, no `assetPrefix`, and none needed** — the repo is `Vin-dictive/Vin-dictive.github.io`, a
GitHub *user* site served from the domain root. All asset references are root-absolute (`/tailscale.svg`,
`/pictures/*.JPG`) and that is correct. Keep it that way.

The artifact is purely `./out`, so **everything must resolve at build time**. Nothing may be fetched at
runtime that is not already under `public/`.

`.claude/settings.local.json` grants only four permissions; `yarn`, `npm`, `next build` and `git` will
all prompt.

---

## 4. File layout

### New — route

| Path | Role |
|---|---|
| `app/room/page.tsx` | **Server Component.** Slices `data/profile.json`, exports `metadata`, renders the client shell **and the accessibility DOM mirror** (§9). |
| `components/room/RoomShell.tsx` | `'use client'`. **The `ssr: false` boundary** — holds `dynamic(() => import('./RoomCanvas'), { ssr: false, loading: … })`. Mandatory: `page.tsx` is a Server Component and `ssr: false` errors there (§3). Also renders the bar, the corner controls, and the no-WebGL fallback. |
| `components/room/RoomCanvas.tsx` | `'use client'`. The R3F `<Canvas>`, camera, composer and scene graph. Browser-only by construction. |

### New — scene components

- `components/room/Wall.tsx` — the ring/arc of curved panels for the active section.
- `components/room/Panel.tsx` — one curved panel mesh plus its texture.
- `components/room/Environment.tsx` — enclosing shell, floor gradient, accent light.
- `components/room/Effects.tsx` — the post chain.

### New — logic (plain TS, no React)

- `components/room/paint.ts` — the Canvas2D panel painter. **The crux of the build**; see §5.
- `components/room/layout.ts` — ring/arc angle maths and the content → panel mapping.
- `components/room/geometry.ts` — the curved-panel geometry helper.
- `components/room/useYaw.ts` — input + inertia + snap controller.
- `components/room/useRoomSkin.ts` — theme → uniform plumbing.
- `lib/useTheme.ts` — `useIsDark()`, extracted from `ThemeToggle.tsx`.

### Modified — three files, all minimally

1. **`components/Navigation.tsx`** — add a `[ Page | Room ]` segmented control to the existing
   right-hand action cluster (`:230-243`), beside `<ThemeToggleButton />`. Style it with the existing
   `navActionPill` constant (`:67-68`). **Do not** touch the `NAV` array or the scroll-spy effect.
2. **`components/ThemeToggle.tsx`** — extract the `useSyncExternalStore` + `MutationObserver` trio
   (`:7-28`) into `lib/useTheme.ts` and import it back. Pure refactor, no behaviour change. The room
   needs the identical subscription and duplicating it would be worse.
3. **`components/CursorDotBackground.tsx`** — early-return `null` on `/room` via `usePathname()`. It
   paints an **opaque** full-viewport fill at `z-0` (`:113-114`), so beneath the room it is both
   invisible and a wasted rAF loop.

**Untouched:** `app/layout.tsx`, `app/page.tsx`, all of `components/sections/*`, `app/gallery/*`, and
`next.config.js`.

---

## 5. Panel rendering — the crux

**Decision: Canvas2D-painted textures mapped onto curved meshes.**

Alternatives considered and rejected:

- **drei `<Html transform>`** — perfect type, but needs ~19 composited DOM layers, gives no real
  curvature, and degrades badly on mobile.
- **SDF text (drei `<Text>` / troika)** — excellent for headlines, but cannot express the mixed-weight,
  multi-column, logo-bearing panel bodies this content needs.

### Fonts into canvas

Because the font variables resolve to plain family names (§3), the painter can do:

```ts
const root = getComputedStyle(document.documentElement)
const label = root.getPropertyValue('--font-space-grotesk')  // '"Space Grotesk", "Space Grotesk Fallback"'
const body  = root.getPropertyValue('--font-inter')
ctx.font = `700 24px ${label}`
```

**Gate every paint behind `await document.fonts.ready`, plus an explicit `document.fonts.load()` for each
weight actually used** (e.g. `document.fonts.load('700 24px "Space Grotesk"')`). Without this the first
paint silently falls back to the metric-matched fallback face and looks subtly wrong — and because it is
baked into a texture, it stays wrong until something triggers a repaint.

### Texture budget

Panels are ~2.4 × 3.0 world units at radius 6. At 55° FOV on a 1440px viewport one occupies roughly
290 CSS px, i.e. ~580 device px at DPR 2.

- **Rest tier: 512 × 640** RGBA — 1.31 MB, ~1.75 MB with mipmaps. 19 top-level panels ≈ **33 MB**.
- **Mobile tier: 384 × 480** ≈ **19 MB**.
- **Focus tier: 1024 × 1280** from a **pool of 2** (focused + incoming), so the panel you are actually
  reading is crisp while the ceiling stays bounded.
- **Drill-down facet textures are painted lazily on open and disposed on close.** Three facets per item,
  so a project ring costs 3 textures, never 36. Call `.dispose()` — this is the most likely place to
  leak VRAM.

### Sampling — matters more than resolution here

Text on a cylinder is viewed at a glancing angle, which is exactly the case anisotropic filtering exists
for. Every texture gets:

```ts
tex.colorSpace   = THREE.SRGBColorSpace
tex.generateMipmaps = true
tex.minFilter    = THREE.LinearMipmapLinearFilter
tex.anisotropy   = Math.min(gl.capabilities.getMaxAnisotropy(), 8)
```

Skipping the anisotropy line is the single most likely cause of "the text looks mushy".

### Panel vocabulary

Reproduce the existing card anatomy so a wall panel reads as the same design system rather than a
parallel one.

From `components/sections/ProjectsSection.tsx:73-93`: a zero-padded `01` index in `--folio-secondary` at
~0.35em tracking; the name bold in `--folio-on-surface`; a three-line clamped description in
`--folio-on-surface-variant`; a tracked uppercase `OPEN PROJECT ↗` footer.

Journey panels follow `ExperienceEducationSection.tsx` the same way — logo tile, duration in accent for
the current role, tech chips above a hairline rule.

For label metrics, borrow the reference's: **10px, `.16em` tracking, uppercase**. It is the detail that
most makes the room feel designed.

### Logos

Load the `public/*.svg` marks via `new Image()`, draw them in, then flood them to a flat silhouette:

```ts
ctx.drawImage(logo, x, y, w, h)
ctx.globalCompositeOperation = 'source-in'
ctx.fillStyle = onSurface
ctx.fillRect(x, y, w, h)
ctx.globalCompositeOperation = 'source-over'
```

This mirrors what the site already does with `.logo-icon` (`app/globals.css`: `brightness(0)
saturate(100%)`, inverted in dark) — and critically, it fixes `bluerabbit-logo-white.svg`, which is white
on transparent and would otherwise disappear entirely in the light skin.

Note SVGs without intrinsic dimensions can fail to rasterise in some browsers; pass explicit width and
height to `drawImage`.

---

## 6. Scene graph & geometry

- Camera at the origin, **55° FOV**, looking down `-Z`. Wall radius **R = 6**.
- Panels are open-ended cylinder sectors:
  `new THREE.CylinderGeometry(R, R, height, 24, 1, true, thetaStart, thetaLength)` with
  `side: THREE.BackSide`, so they read from inside and are genuinely curved rather than faceted.
  - **Confirm empirically:** sector UVs run `u` around theta, and `BackSide` mirrors `u`. Expect to
    compensate with `texture.repeat.x = -1` and `texture.offset.x = 1`. Verify on the first textured
    render rather than trusting this.
- **Work ring** — 12 panels, evenly spaced over the full 360°: 30° pitch, ~2.4 units wide with a ~0.74
  gap.
- **Journey arc** — 4 experience + 2 education merged newest-first and spread across **~300°**, leaving a
  60° gap that reads as the room's entrance. Each panel carries its employer/institution logo.
- **Info station** — *not* a ring. One wide panel spanning ~90° holding name, quote, location and the
  contact affordances, facing you on landing.
- **Environment** — a larger enclosing cylinder plus a floor with a vertical gradient, lit primarily by
  an accent-coloured light behind the focused panel, so the room reads as lit *by* its content. This is
  the cheap, honest gesture toward the reference's light map.

---

## 7. Interaction controller (`useYaw.ts`)

One source of truth: **`theta`, held in a ref**. Never React state — a rAF loop writing state would
thrash renders.

```
useFrame(dt):
  theta    += velocity * dt
  velocity *= damping ** dt                 // damping ≈ 0.0015
  if (idle && |velocity| < ε)
      spring theta → nearest panel angle    // critically damped
```

Inputs, all feeding `velocity` or a spring target:

| Input | Mapping |
|---|---|
| `pointerdown/move/up` (with pointer capture) | `velocity = -dx * k` |
| `wheel` | `velocity += (deltaX \|\| deltaY) * k₂`, listener `{ passive: false }` + `preventDefault()` |
| `ArrowLeft` / `ArrowRight`, and the on-screen `← →` | spring to the adjacent index |
| touch swipe | same path as pointer |

Feeding `deltaX || deltaY` is what makes a trackpad two-finger swipe and a mouse wheel feel like the same
gesture. Do not special-case them.

**React state is reserved for exactly three things** — active section, focused index, and the open item —
because those drive the DOM bar, the `aria-live` announcement and focus management. Everything else stays
in refs.

### Drill-down sequence

State machine: `'ring' → 'opening' → 'detail' → 'closing'`, driven by a single `progress` ref lerped in
`useFrame`.

1. **Dissolve** (~450 ms) — panels scale and fade out, each delayed in proportion to its angular distance
   from the focused panel, so the dissolve ripples outward.
2. **Build** — paint the facet textures, swap the geometry.
3. **Re-form** (~450 ms) — the same ripple, inward.

Reverse on close. `↑ ALL WORK` bottom-left, `← →` bottom-right, matching the reference.

Facet rings per item type:

- **Project** → `[ TITLE (numbered name), BRIEF (description), OPEN (link + URL) ]`
- **Experience** → `[ ROLE (title/company/duration/location), BRIEF, STACK (tech chips) ]`
- **Education** → `[ DEGREE, DETAILS, GRADE ]`
- **Info** → no drill-down; its contact affordances open mail/LinkedIn directly.

---

## 8. Dual skin

Subscribe to the existing DOM-based theme via `lib/useTheme.ts` (the extracted `useSyncExternalStore` +
`MutationObserver`), and read the folio tokens using the same space-separated-triplet parse at
`CursorDotBackground.tsx:5-14`.

- **Scalars** — ground, accent, bloom intensity, grain amount, vignette — live in one uniform block and
  **lerp per-frame** toward their targets. No hard cut.
- **Panel textures must be fully repainted on a theme flip**, since text colour and panel ground are
  baked in. Cost: ~19 canvas repaints. Mitigate by repainting **progressively across several frames**,
  focused panel first and working outward, and crossfade by holding the outgoing texture on a duplicate
  mesh for ~400 ms.

> This repaint is the real price of the dual-skin decision. It is manageable, but it is the one place
> where the choice costs noticeably more than a single fixed skin would have. Budget for it rather than
> discovering it.

---

## 9. Accessibility & SEO

A canvas on a statically-exported site is invisible to both screen readers and crawlers. So:

- **`app/room/page.tsx` renders a visually-hidden but complete semantic mirror** of all room content —
  real headings, lists and links for every project, role, degree, plus the contact details. It is server
  rendered, so it lands in the exported HTML and is crawlable.
- The canvas itself gets `role="img"` and a descriptive `aria-label`, as the reference does.
- **Keyboard operability** — a visually-hidden but *focusable* button per panel; focusing one rotates the
  room to it. This is what makes a WebGL carousel genuinely keyboard-navigable rather than nominally so.
  Visible `← →` and `↑ All work` controls are real buttons with `min-height: 44px`.
- **`aria-live="polite"`** announces focus changes — *"Project 3 of 12, Cow Lameness Detection"*.
- **Focus management** — opening a drill-down moves focus to `↑ All work`; closing returns it to the
  originating panel's hidden button.
- Honour `:focus-visible` with a visible outline in the accent colour.

---

## 10. Post-processing

`EffectComposer` from `@react-three/postprocessing`:

| Effect | Dark | Light |
|---|---|---|
| `Bloom` | threshold 0.55, intensity 0.9 | threshold 0.85, intensity 0.25 |
| `Vignette` | 0.35 | 0.15 |
| `Noise` (grain) | 0.035 | 0.015 |
| `ChromaticAberration` | 0.0006 | 0 |

`DepthOfField` — the reference's "focus pull" — is **deliberately deferred**. It is the most expensive
effect and the least missed. Add it only once everything else is solid.

**Escape hatch:** bypass the whole composer under `prefers-reduced-motion`, on the mobile tier, and via a
`?plain` query flag.

---

## 11. Performance & fallbacks

- **DPR capped at `Math.min(devicePixelRatio, 2)`** — the same cap as `CursorDotBackground.tsx:53`.
  Pass via `<Canvas dpr={[1, 2]}>`.
- **Pause the loop on `visibilitychange`.** No existing background in this repo does this; it is a
  genuine improvement, not a deviation from a deliberate pattern.
- **`prefers-reduced-motion` degrades, it does not unmount** — matching this repo's established
  convention (both existing backgrounds keep rendering and merely zero their motion). No idle drift, no
  animated grain, transitions become instant — but turning the room still works.
- **No WebGL2** → render a short message and a link back to `/`. Never a blank canvas. The reference does
  exactly this, swapping its `aria-label` to *"This view needs WebGL2, which this browser has turned
  off."*
- **Mobile** — smaller texture tier, composer off, fewer panels in view.
- **Bundle, honestly: ~300–350 KB gzipped, on `/room/` only.** three ~170, R3F ~40, postprocessing
  ~60–70, remainder glue. **Avoid `@react-three/drei` entirely** unless something specific needs it —
  nothing in this plan does, and skipping it saves 20–40 KB.

---

## 12. Dependencies

```bash
yarn add three@0.186.1 @react-three/fiber@9.8.2 @react-three/postprocessing@3.2.2 postprocessing@6.39.5
yarn add -D @types/three@0.186.0
```

**Pin `three` — do not use a caret.** Verified peer ranges:

| Package | Version | Peer constraint |
|---|---|---|
| `three` | 0.186.1 | — |
| `@types/three` | 0.186.0 | matches `three` |
| `@react-three/fiber` | 9.8.2 | `react: ">=19 <19.4"` — satisfied by React 19.3 |
| `@react-three/postprocessing` | 3.2.2 | `postprocessing: "^6.36.0"`, `@react-three/fiber: ">=9.7.0"` |
| `postprocessing` | 6.39.5 | **`three: ">= 0.168.0 < 0.187.0"`** |

`three@0.186.1` satisfies that last range by exactly one minor version. A caret would let a future
`0.187` through and silently break the peer.

**`yarn.lock` must be committed in the same commit** — CI runs `yarn install --frozen-lockfile` and will
fail otherwise.

**No `next.config.js` change is needed.** Shaders are TypeScript template literals, not `.glsl` imports,
so Turbopack needs no loader rule.

---

## 13. Delivery order

Each stage is runnable, so progress is visible early and the risky parts are de-risked in order.

1. **Shell** — `/room/` route, the bar, the toggle in `Navigation.tsx`, the no-WebGL fallback, the a11y
   mirror. **No 3D yet.** Ship this first; it proves the routing and leaves the site in a working state.
2. **Room** — cylinder, camera, one ring of *untextured* panels, `useYaw` with inertia and snap. **This
   is the stage that proves the navigation feels right** — do not proceed until turning the room feels
   good, because everything after it is decoration.
3. **Paint** — the Canvas2D painter with real fonts and logo silhouettes; the Work ring becomes real.
   This is the highest-risk stage (§5).
4. **Sections** — Journey arc, Info station, section switching.
5. **Drill-down** — dissolve / re-form.
6. **Skin + post** — dual-skin crossfade, the post chain.
7. **Hardening** — DPR, `visibilitychange`, mobile tier, reduced motion, focus management.

---

## 14. Verification

There is **no test suite and no headless browser** in this repo. Verification is manual, via `yarn dev`.

- `/` renders identically to before. **Confirm `three` is absent from its chunks** — check the build
  output or the network panel. This is the entire justification for a separate route; if three leaks
  onto `/`, the architecture has failed.
- Toggle `/` ↔ `/room/` both ways. Confirm client-side navigation, no full reload.
- Turn the room by drag, mouse wheel, trackpad two-finger (**horizontal and vertical**), `←`/`→`, and
  touch. All five should feel like the same gesture.
- Snap lands cleanly on a panel from both directions, including at high flick velocity.
- Drill into a project and back out. Confirm focus lands on `↑ All work` and returns correctly.
- **Flip the theme while inside the room.** Confirm the crossfade and that no panel is left holding stale
  colours.
- Tab through with the canvas hidden via devtools, to confirm the a11y mirror is complete and in a
  sensible order.
- `prefers-reduced-motion` on: the room is still navigable, nothing drifts, no animated grain.
- Throttle to a mobile DPR and viewport; confirm the lower texture tier engages and the composer is off.
- Open with `?plain`; confirm the composer is bypassed.
- `yarn build` succeeds and `out/room/index.html` contains the full a11y mirror text.
- Watch VRAM across repeated drill-down open/close cycles — this is where a missing `.dispose()` shows
  up.

---

## 15. Known risks

| Risk | Where | Mitigation |
|---|---|---|
| Text mushy at glancing angles | §5 | Anisotropic filtering is not optional. Verify `getMaxAnisotropy()` actually returns > 1. |
| First paint uses the fallback font, baked permanently into a texture | §5 | `await document.fonts.ready` **and** explicit `document.fonts.load()` per weight. |
| Cylinder-sector UVs mirrored under `BackSide` | §6 | Confirm on first textured render; expect `repeat.x = -1`, `offset.x = 1`. |
| VRAM leak on repeated drill-down | §5 | Explicit `.dispose()` on close; watch across cycles. |
| Theme-flip jank from ~19 simultaneous repaints | §8 | Stagger across frames, focused panel first. |
| Room state fighting scroll-spy over the URL hash | §3 | Do not put room state in the hash at all. |
| SVG logos failing to rasterise without intrinsic size | §5 | Pass explicit width/height to `drawImage`. |
