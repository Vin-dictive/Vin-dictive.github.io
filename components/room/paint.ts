/**
 * Canvas2D panel painter. Every wall panel is typography baked into a texture,
 * so this is where legibility is won or lost. Everything is laid out in a
 * per-size logical space and scaled to whichever texture tier is requested.
 */

import { pad2, PANEL_SIZES, type FacetContent, type JourneyEntry, type PanelContent, type PanelSize, type RoomPersonal, type ContactLink, type RoomProject } from "./layout"

type RGB = readonly [number, number, number]

export interface PaintTheme {
  isDark: boolean
  card: string
  cardEdge: string
  chip: string
  onSurface: string
  variant: string
  primary: string
  secondary: string
  rule: string
  glow: string
  logo: string
  fonts: { label: string; body: string }
}

/** Normalised (0–1, y down) texture-space rectangle that opens a link. */
export interface HitRegion {
  x: number
  y: number
  w: number
  h: number
  href: string
}

function parseTriplet(s: string, fallback: RGB): RGB {
  const p = s.trim().split(/\s+/).map(Number)
  return p.length >= 3 && p.every((n) => !Number.isNaN(n)) ? [p[0], p[1], p[2]] : fallback
}

const rgba = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]

/** Reads folio tokens and font families. Fonts are declared on <body> by next/font. */
export function readPaintTheme(): PaintTheme {
  const isDark = document.documentElement.classList.contains("dark")
  const css = getComputedStyle(document.body)
  const tri = (name: string, fb: RGB) => parseTriplet(css.getPropertyValue(name), fb)
  const surface = tri("--folio-surface", [14, 14, 14])
  const highest = tri("--folio-surface-highest", [38, 38, 38])
  const onSurface = tri("--folio-on-surface", [255, 255, 255])
  const variant = tri("--folio-on-surface-variant", [173, 170, 170])
  const primary = tri("--folio-primary", [255, 142, 131])
  const secondary = tri("--folio-secondary", [253, 126, 147])
  const outline = tri("--folio-outline-variant", [72, 72, 71])

  return {
    isDark,
    card: rgba(isDark ? mix(surface, highest, 0.45) : mix(surface, [255, 255, 255], 0.75)),
    cardEdge: rgba(onSurface, isDark ? 0.1 : 0.12),
    chip: rgba(isDark ? mix(surface, highest, 0.8) : mix(surface, highest, 0.35)),
    onSurface: rgba(onSurface),
    variant: rgba(variant),
    primary: rgba(primary),
    secondary: rgba(secondary),
    rule: rgba(isDark ? [255, 255, 255] : outline, isDark ? 0.1 : 0.6),
    glow: rgba(primary, isDark ? 0.13 : 0.1),
    logo: rgba(onSurface, isDark ? 1 : 0.85),
    fonts: {
      label: css.getPropertyValue("--font-space-grotesk").trim() || "ui-monospace, monospace",
      body: css.getPropertyValue("--font-inter").trim() || "system-ui, sans-serif",
    },
  }
}

let fontsReady: Promise<void> | null = null

/**
 * Resolves once every face the painter uses is loaded. A texture painted with
 * the fallback face stays wrong until the next repaint, so this gates all paints.
 */
export function ensureFonts(theme: PaintTheme) {
  fontsReady ??= (async () => {
    const { body, label } = theme.fonts
    const faces = [`400 16px ${body}`, `500 16px ${body}`, `700 16px ${body}`, `500 16px ${label}`, `700 16px ${label}`]
    await Promise.all(faces.map((f) => document.fonts.load(f).catch(() => [])))
    await document.fonts.ready
  })()
  return fontsReady
}

const logos = new Map<string, HTMLImageElement | null>()

export async function preloadLogos(srcs: string[]) {
  await Promise.all(
    srcs
      .filter((src) => !logos.has(src))
      .map(async (src) => {
        const img = new Image()
        img.decoding = "async"
        img.src = src
        try {
          await img.decode()
          logos.set(src, img)
        } catch {
          logos.set(src, null)
        }
      }),
  )
}

let scratch: HTMLCanvasElement | null = null

/**
 * Draws a logo as a flat silhouette in `color`. The flood runs on a scratch
 * canvas: `source-in` is unbounded and would wipe the panel if done in place.
 * This also rescues white-on-transparent marks in the light skin.
 */
function drawLogo(ctx: CanvasRenderingContext2D, src: string, x: number, y: number, size: number, color: string, scale: number) {
  const img = logos.get(src)
  if (!img) return
  const px = Math.max(8, Math.ceil(size * scale))
  scratch ??= document.createElement("canvas")
  scratch.width = px
  scratch.height = px
  const o = scratch.getContext("2d")
  if (!o) return
  const iw = img.naturalWidth || px
  const ih = img.naturalHeight || px
  const k = Math.min(px / iw, px / ih)
  const dw = iw * k
  const dh = ih * k
  o.drawImage(img, (px - dw) / 2, (px - dh) / 2, dw, dh)
  o.globalCompositeOperation = "source-in"
  o.fillStyle = color
  o.fillRect(0, 0, px, px)
  o.globalCompositeOperation = "source-over"
  ctx.drawImage(scratch, x, y, size, size)
}

/* ------------------------------------------------------------------ text */

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, size: number, em: number) {
  const chars = [...text]
  let w = 0
  for (const c of chars) w += ctx.measureText(c).width
  return w + size * em * Math.max(0, chars.length - 1)
}

/** Letter-spaced text, drawn per glyph so tracking works in every browser. */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  em: number,
  align: "left" | "right" | "center" = "left",
) {
  const total = trackedWidth(ctx, text, size, em)
  let cx = align === "left" ? x : align === "right" ? x - total : x - total / 2
  ctx.textAlign = "left"
  for (const c of text) {
    ctx.fillText(c, cx, y)
    cx += ctx.measureText(c).width + size * em
  }
  return total
}

interface LabelOpts {
  size?: number
  weight?: number
  em?: number
  color: string
  align?: "left" | "right" | "center"
  maxW?: number
}

/** The room's label voice: Space Grotesk, ~10px, .16em, uppercase. */
function drawLabel(ctx: CanvasRenderingContext2D, t: PaintTheme, text: string, x: number, y: number, o: LabelOpts) {
  let size = o.size ?? 10
  const em = o.em ?? 0.16
  const weight = o.weight ?? 700
  let s = text.toUpperCase()
  setFont(ctx, weight, size, t.fonts.label)
  if (o.maxW) {
    while (size > 7.5 && trackedWidth(ctx, s, size, em) > o.maxW) {
      size -= 0.5
      setFont(ctx, weight, size, t.fonts.label)
    }
    while (s.length > 1 && trackedWidth(ctx, s, size, em) > o.maxW) s = `${s.slice(0, -2)}…`
  }
  ctx.fillStyle = o.color
  return drawTracked(ctx, s, x, y, size, em, o.align)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width <= maxW) {
      line = test
      continue
    }
    if (line) lines.push(line)
    if (ctx.measureText(word).width <= maxW) {
      line = word
      continue
    }
    let chunk = ""
    for (const ch of word) {
      if (chunk && ctx.measureText(chunk + ch).width > maxW) {
        lines.push(chunk)
        chunk = ch
      } else chunk += ch
    }
    line = chunk
  }
  if (line) lines.push(line)
  return lines
}

function clampLines(ctx: CanvasRenderingContext2D, lines: string[], max: number, maxW: number) {
  if (lines.length <= max) return lines
  const out = lines.slice(0, Math.max(1, max))
  let last = out[out.length - 1]
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1)
  out[out.length - 1] = `${last.replace(/[\s,.;:–-]+$/, "")}…`
  return out
}

/** Baseline of line `i` in a block starting at `top`. */
const baseline = (top: number, i: number, size: number, lh: number) => top + i * size * lh + ((lh - 1) * size) / 2 + size * 0.8

interface Block {
  lines: (string | null)[]
  size: number
  lh: number
  height: number
}

/** Wraps `text` (paragraphs split on blank lines) at the largest size that fits `maxH`. */
function fitBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  weight: number,
  sizes: number[],
  lh: number,
  maxW: number,
  maxH: number,
): Block {
  const paragraphs = text.split(/\n\s*\n/)
  let block: Block = { lines: [], size: sizes[0], lh, height: 0 }
  for (const size of sizes) {
    setFont(ctx, weight, size, family)
    const lines: (string | null)[] = []
    paragraphs.forEach((p, i) => {
      if (i > 0) lines.push(null)
      lines.push(...wrapText(ctx, p, maxW))
    })
    const height = lines.reduce((h, l) => h + (l === null ? size * 0.7 : size * lh), 0)
    block = { lines, size, lh, height }
    if (height <= maxH) return block
  }
  const size = block.size
  setFont(ctx, weight, size, family)
  const fit = Math.max(1, Math.floor(maxH / (size * lh)))
  const flat = clampLines(ctx, block.lines.filter((l): l is string => l !== null), fit, maxW)
  return { lines: flat, size, lh, height: flat.length * size * lh }
}

function drawBlock(ctx: CanvasRenderingContext2D, b: Block, family: string, weight: number, color: string, x: number, top: number) {
  setFont(ctx, weight, b.size, family)
  ctx.fillStyle = color
  ctx.textAlign = "left"
  let y = top
  for (const line of b.lines) {
    if (line === null) {
      y += b.size * 0.7
      continue
    }
    ctx.fillText(line, x, baseline(y, 0, b.size, b.lh))
    y += b.size * b.lh
  }
  return y
}

/* ------------------------------------------------------------- shapes */

function card(ctx: CanvasRenderingContext2D, t: PaintTheme, W: number, H: number, glow: boolean) {
  const r = 18
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0.5, 0.5, W - 1, H - 1, r)
  ctx.fillStyle = t.card
  ctx.fill()
  ctx.clip()
  const sheen = ctx.createLinearGradient(0, 0, 0, H * 0.4)
  sheen.addColorStop(0, t.isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.6)")
  sheen.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, W, H)
  if (glow) {
    const g = ctx.createRadialGradient(W - 10, 10, 0, W - 10, 10, Math.min(W, H) * 0.55)
    g.addColorStop(0, t.glow)
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  ctx.restore()
  ctx.beginPath()
  ctx.roundRect(0.5, 0.5, W - 1, H - 1, r)
  ctx.strokeStyle = t.cardEdge
  ctx.lineWidth = 1
  ctx.stroke()
}

function rule(ctx: CanvasRenderingContext2D, t: PaintTheme, x: number, y: number, w: number) {
  ctx.fillStyle = t.rule
  ctx.fillRect(x, y, w, 1)
}

function arrowUpRight(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, lw = 1.5) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  ctx.moveTo(x, y + s)
  ctx.lineTo(x + s, y)
  ctx.moveTo(x + s * 0.3, y)
  ctx.lineTo(x + s, y)
  ctx.lineTo(x + s, y + s * 0.7)
  ctx.stroke()
  ctx.restore()
}

function tile(ctx: CanvasRenderingContext2D, t: PaintTheme, x: number, y: number, s: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, s, s, s * 0.26)
  ctx.fillStyle = t.chip
  ctx.fill()
  ctx.strokeStyle = t.cardEdge
  ctx.lineWidth = 1
  ctx.stroke()
}

/** Flow-laid chips; overflow past `maxRows` collapses into a "+N" chip. Returns the height used. */
function chips(ctx: CanvasRenderingContext2D, t: PaintTheme, items: string[], x: number, y: number, maxW: number, size: number, maxRows: number) {
  const h = Math.round(size * 2.3)
  const padX = size * 0.9
  const gap = size * 0.55
  const em = 0.1
  setFont(ctx, 500, size, t.fonts.label)
  const widthOf = (s: string) => trackedWidth(ctx, s.toUpperCase(), size, em) + padX * 2

  const rows: { text: string; w: number }[][] = [[]]
  let cx = 0
  let placed = 0
  for (const item of items) {
    const w = widthOf(item)
    if (cx > 0 && cx + w > maxW) {
      rows.push([])
      cx = 0
    }
    rows[rows.length - 1].push({ text: item, w: Math.min(w, maxW) })
    cx += w + gap
    placed++
  }
  if (rows.length > maxRows) {
    rows.length = maxRows
    const last = rows[maxRows - 1]
    placed = rows.reduce((n, r) => n + r.length, 0)
    const used = () => last.reduce((s, c) => s + c.w + gap, 0)
    while (last.length > 0 && used() + widthOf(`+${items.length - placed}`) > maxW) {
      last.pop()
      placed--
    }
    const more = `+${items.length - placed}`
    last.push({ text: more, w: widthOf(more) })
  }

  rows.forEach((row, r) => {
    let rx = x
    const ry = y + r * (h + gap)
    for (const chip of row) {
      ctx.beginPath()
      ctx.roundRect(rx, ry, chip.w, h, h / 2)
      ctx.fillStyle = t.chip
      ctx.fill()
      ctx.strokeStyle = t.cardEdge
      ctx.stroke()
      ctx.save()
      ctx.beginPath()
      ctx.rect(rx, ry, chip.w, h)
      ctx.clip()
      ctx.fillStyle = t.variant
      setFont(ctx, 500, size, t.fonts.label)
      drawTracked(ctx, chip.text.toUpperCase(), rx + padX, ry + h / 2 + size * 0.36, size, em)
      ctx.restore()
      rx += chip.w + gap
    }
  })
  return rows.length * h + (rows.length - 1) * gap
}

/* ------------------------------------------------------------- panels */

/** Logical (layout) width per panel size; height follows the world aspect. */
const LOGICAL_W: Record<PanelSize, number> = { work: 320, journey: 340, facet: 360, info: 1200 }

export function logicalSize(size: PanelSize) {
  const { w, h } = PANEL_SIZES[size]
  const W = LOGICAL_W[size]
  return { W, H: Math.round((W * h) / w) }
}

export type Tier = "rest" | "focus"

/** Texture width in px for a panel size and tier. */
export function textureWidth(size: PanelSize, tier: Tier, mobile: boolean) {
  if (size === "info") return mobile ? 1536 : 2048
  if (tier === "focus") return mobile ? 768 : 1024
  return mobile ? 384 : 512
}

function paintProject(ctx: CanvasRenderingContext2D, t: PaintTheme, W: number, H: number, c: { n: number; project: RoomProject }) {
  const P = 26
  card(ctx, t, W, H, false)
  drawLabel(ctx, t, pad2(c.n), P, P + 14, { size: 11, em: 0.35, color: t.secondary })
  const ts = 30
  tile(ctx, t, W - P - ts, P - 4, ts)
  arrowUpRight(ctx, W - P - ts + 10, P + 6, 10, t.variant)

  const maxW = W - P * 2
  setFont(ctx, 700, 22, t.fonts.body)
  const name = clampLines(ctx, wrapText(ctx, c.project.name, maxW), 3, maxW)
  ctx.fillStyle = t.onSurface
  name.forEach((l, i) => ctx.fillText(l, P, baseline(P + 46, i, 22, 1.25)))
  const top = P + 46 + name.length * 22 * 1.25 + 14

  const footerTop = H - P - 34
  const desc = fitBlock(ctx, c.project.description, t.fonts.body, 400, [14], 1.55, maxW, footerTop - top - 12)
  drawBlock(ctx, desc, t.fonts.body, 400, t.variant, P, top)

  rule(ctx, t, P, footerTop, maxW)
  const w = drawLabel(ctx, t, "Open project", P, H - P - 6, { size: 10.5, color: t.onSurface })
  arrowUpRight(ctx, P + w + 8, H - P - 15, 8, t.primary)
}

function paintJourney(ctx: CanvasRenderingContext2D, t: PaintTheme, W: number, H: number, scale: number, e: JourneyEntry) {
  const P = 26
  const maxW = W - P * 2
  card(ctx, t, W, H, true)

  const ts = 46
  tile(ctx, t, P, P, ts)
  drawLogo(ctx, e.logo, P + 10, P + 10, ts - 20, t.logo, scale)
  const right = W - P
  const metaW = maxW - ts - 16
  drawLabel(ctx, t, e.kind, right, P + 16, { size: 9.5, color: t.variant, align: "right", maxW: metaW })
  drawLabel(ctx, t, e.duration, right, P + 34, {
    size: 10,
    color: e.current ? t.primary : t.variant,
    align: "right",
    maxW: metaW,
  })

  let y = P + ts + 22
  setFont(ctx, 700, 20, t.fonts.body)
  const title = clampLines(ctx, wrapText(ctx, e.title, maxW), 2, maxW)
  ctx.fillStyle = t.onSurface
  title.forEach((l, i) => ctx.fillText(l, P, baseline(y, i, 20, 1.25)))
  y += title.length * 20 * 1.25 + 6

  const sub = [e.org, e.location].filter(Boolean).join(" · ").toUpperCase()
  setFont(ctx, 500, 10, t.fonts.label)
  const subLines = clampLines(ctx, wrapText(ctx, sub, maxW - 20), 2, maxW - 20)
  ctx.fillStyle = t.variant
  subLines.forEach((l, i) => drawTracked(ctx, l, P, baseline(y, i, 10, 1.6), 10, 0.1))
  y += subLines.length * 10 * 1.6 + 12

  if (e.kind === "experience") {
    const chipSize = 8.5
    const chipH = Math.round(chipSize * 2.3)
    const chipsH = chipH * 2 + chipSize * 0.55
    const chipsTop = H - P - chipsH
    rule(ctx, t, P, chipsTop - 14, maxW)
    const desc = fitBlock(ctx, e.description, t.fonts.body, 400, [13, 12.5, 12], 1.5, maxW, chipsTop - 28 - y)
    drawBlock(ctx, desc, t.fonts.body, 400, t.variant, P, y)
    chips(ctx, t, e.chips, P, chipsTop, maxW, chipSize, 2)
  } else {
    const [gradeLabel, gradeValue] = (e.grade ?? "").split(/:\s*/)
    const chipSize = 8.5
    const chipH = Math.round(chipSize * 2.3)
    const chipsH = chipH * 2 + chipSize * 0.55
    const chipsTop = H - P - chipsH
    if (gradeValue) {
      drawLabel(ctx, t, gradeLabel, P, y + 12, { size: 9.5, color: t.variant })
      setFont(ctx, 700, 40, t.fonts.label)
      ctx.fillStyle = t.primary
      ctx.textAlign = "left"
      ctx.fillText(gradeValue, P - 1, y + 58)
    }
    rule(ctx, t, P, chipsTop - 14, maxW)
    chips(ctx, t, e.chips, P, chipsTop, maxW, chipSize, 2)
  }
}

function paintFacet(ctx: CanvasRenderingContext2D, t: PaintTheme, W: number, H: number, scale: number, f: FacetContent, regions: HitRegion[]) {
  const P = 30
  const maxW = W - P * 2
  card(ctx, t, W, H, true)

  const stepW = drawLabel(ctx, t, `${pad2(f.step)} / ${pad2(f.steps)}`, P, P + 12, { size: 11, em: 0.35, color: t.secondary })
  drawLabel(ctx, t, f.tag, P + stepW + 14, P + 12, { size: 10, color: t.variant })
  drawLabel(ctx, t, f.eyebrow, P, P + 34, { size: 9.5, color: t.variant, maxW })
  let y = P + 52

  const footerH = f.link ? 76 : 0
  const bottom = H - P - footerH

  if (f.logo) {
    const s = 56
    tile(ctx, t, P, y, s)
    drawLogo(ctx, f.logo, P + 13, y + 13, s - 26, t.logo, scale)
    y += s + 22
  }

  if (f.big) {
    let size = 104
    setFont(ctx, 700, size, t.fonts.label)
    while (size > 40 && ctx.measureText(f.big).width > maxW) {
      size -= 4
      setFont(ctx, 700, size, t.fonts.label)
    }
    ctx.fillStyle = t.primary
    ctx.textAlign = "left"
    ctx.fillText(f.big, P - size * 0.04, y + size * 0.82)
    y += size * 0.95 + 10
  }

  const headSize = f.heading.length > 40 ? 22 : 26
  setFont(ctx, 700, headSize, t.fonts.body)
  const head = clampLines(ctx, wrapText(ctx, f.heading, maxW), 4, maxW)
  ctx.fillStyle = t.onSurface
  head.forEach((l, i) => ctx.fillText(l, P, baseline(y, i, headSize, 1.2)))
  y += head.length * headSize * 1.2 + 18

  if (f.lines?.length) {
    setFont(ctx, 400, 15, t.fonts.body)
    for (const line of f.lines) {
      const wrapped = clampLines(ctx, wrapText(ctx, line, maxW - 18), 3, maxW - 18)
      if (y + wrapped.length * 15 * 1.45 > bottom - 8) break
      ctx.fillStyle = t.primary
      ctx.fillRect(P, y + 10, 8, 1.5)
      ctx.fillStyle = t.variant
      wrapped.forEach((l, i) => ctx.fillText(l, P + 18, baseline(y, i, 15, 1.45)))
      y += wrapped.length * 15 * 1.45 + 8
    }
  }

  if (f.text) {
    const block = fitBlock(ctx, f.text, t.fonts.body, 400, [17, 16, 15, 14, 13, 12.5, 12, 11.5, 11], 1.55, maxW, bottom - y - 8)
    drawBlock(ctx, block, t.fonts.body, 400, t.variant, P, y)
  }

  if (f.chips?.length) {
    chips(ctx, t, f.chips, P, y, maxW, 10, Math.max(1, Math.floor((bottom - y) / 29)))
  }

  if (f.link) {
    const top = H - P - footerH + 12
    rule(ctx, t, P, top, maxW)
    const w = drawLabel(ctx, t, f.link.cta, P, top + 30, { size: 11, color: t.primary })
    arrowUpRight(ctx, P + w + 9, top + 20, 9, t.primary, 1.7)
    setFont(ctx, 400, 13, t.fonts.body)
    ctx.fillStyle = t.variant
    ctx.fillText(clampLines(ctx, [f.link.display, ""], 1, maxW)[0], P, top + 54)
    regions.push({ x: 0, y: top / H, w: 1, h: (H - top) / H, href: f.link.href })
  }
}

function paintInfo(ctx: CanvasRenderingContext2D, t: PaintTheme, W: number, H: number, p: RoomPersonal, contacts: ContactLink[], regions: HitRegion[]) {
  const P = 52
  const gap = 44
  card(ctx, t, W, H, false)
  ctx.save()
  const g = ctx.createRadialGradient(P, P, 0, P, P, H)
  g.addColorStop(0, t.glow)
  g.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  const c1 = { x: P, w: 400 }
  const c3 = { w: 190, x: W - P - 190 }
  const c2 = { x: c1.x + c1.w + gap, w: c3.x - gap - (c1.x + c1.w + gap) }
  const top = P + 12

  drawLabel(ctx, t, "Info", c1.x, top, { size: 10.5, color: t.secondary, em: 0.35 })
  let size = 62
  setFont(ctx, 700, size, t.fonts.label)
  const name = p.name.toUpperCase().split(/\s+/)
  while (size > 30 && Math.max(...name.map((n) => trackedWidth(ctx, n, size, 0.03))) > c1.w) {
    size -= 2
    setFont(ctx, 700, size, t.fonts.label)
  }
  ctx.fillStyle = t.onSurface
  let y = top + 24
  name.forEach((n, i) => drawTracked(ctx, n, c1.x - 2, baseline(y, i, size, 0.98), size, 0.03))
  y += name.length * size * 0.98 + 26

  ctx.fillStyle = t.primary
  ctx.fillRect(c1.x, y, 28, 2)
  y += 22
  setFont(ctx, 400, 21, t.fonts.body)
  const quote = clampLines(ctx, wrapText(ctx, `“${p.quote}”`, c1.w), 3, c1.w)
  ctx.fillStyle = t.onSurface
  quote.forEach((l, i) => ctx.fillText(l, c1.x, baseline(y, i, 21, 1.4)))

  ctx.beginPath()
  ctx.arc(c1.x + 4, H - P - 4, 4, 0, Math.PI * 2)
  ctx.fillStyle = t.primary
  ctx.fill()
  drawLabel(ctx, t, p.location, c1.x + 16, H - P, { size: 10.5, color: t.variant })

  ctx.fillStyle = t.rule
  ctx.fillRect(c2.x - gap / 2, P, 1, H - P * 2)
  ctx.fillRect(c3.x - gap / 2, P, 1, H - P * 2)

  drawLabel(ctx, t, "About", c2.x, top, { size: 10.5, color: t.variant })
  const about = fitBlock(ctx, p.about, t.fonts.body, 400, [14, 13.5, 13, 12.5, 12, 11.5, 11, 10.5, 10], 1.55, c2.w, H - P - (top + 24))
  drawBlock(ctx, about, t.fonts.body, 400, t.variant, c2.x, top + 24)

  drawLabel(ctx, t, "Contact", c3.x, top, { size: 10.5, color: t.variant })
  const rowH = 58
  contacts.forEach((c, i) => {
    const ry = top + 26 + i * rowH
    const w = drawLabel(ctx, t, c.label, c3.x, ry + 32, { size: 12.5, color: t.onSurface })
    arrowUpRight(ctx, c3.x + w + 10, ry + 22, 9, t.primary, 1.6)
    rule(ctx, t, c3.x, ry + rowH - 1, c3.w)
    regions.push({ x: (c3.x - 12) / W, y: ry / H, w: (c3.w + 24) / W, h: rowH / H, href: c.href })
  })
}

export interface PaintResult {
  canvas: HTMLCanvasElement
  regions: HitRegion[]
}

/** Paints one panel at `pixelWidth` texels wide. Fonts and logos must already be loaded. */
export function paintPanel(content: PanelContent, size: PanelSize, theme: PaintTheme, pixelWidth: number): PaintResult {
  const { W, H } = logicalSize(size)
  const scale = pixelWidth / W
  const canvas = document.createElement("canvas")
  canvas.width = pixelWidth
  canvas.height = Math.round(H * scale)
  const regions: HitRegion[] = []
  const ctx = canvas.getContext("2d")
  if (!ctx) return { canvas, regions }
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.textBaseline = "alphabetic"

  switch (content.type) {
    case "project":
      paintProject(ctx, theme, W, H, content)
      break
    case "journey":
      paintJourney(ctx, theme, W, H, scale, content.entry)
      break
    case "facet":
      paintFacet(ctx, theme, W, H, scale, content, regions)
      break
    case "info":
      paintInfo(ctx, theme, W, H, content.personal, content.contacts, regions)
      break
  }
  return { canvas, regions }
}
