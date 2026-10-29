"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { PANEL_SIZES, ROOM_RADIUS, ringAngles, wrapAngle, type PanelSize, type RingSpec } from "./layout"
import { ensureFonts, paintPanel, preloadLogos, readPaintTheme, textureWidth, type HitRegion, type PaintTheme, type Tier } from "./paint"
import { Panel, type PanelHandle, type PanelTexture } from "./Panel"
import type { Skin } from "./useRoomSkin"
import type { YawController } from "./useYaw"

const DISSOLVE_S = 0.45
const REFORM_S = 0.45
/** Share of the transition spent rippling outward from the focused panel. */
const RIPPLE = 0.45
const CROSSFADE_S = 0.4
/** Panels holding a focus-tier texture at once: enlarged, focused, and the one before. */
const FOCUS_POOL = 3
/** How much a hovered panel grows; it also moves `HOVER_LIFT` toward the viewer. */
const GROW: Record<PanelSize, number> = { work: 0.42, journey: 0.42, info: 0.22, facet: 0 }
const HOVER_LIFT = 0.8

const ease = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

interface Shown {
  ring: RingSpec
  anchor: number
  instance: number
}

interface Hit {
  h: PanelHandle
  region: HitRegion | undefined
}

export default function Wall({
  ring,
  yaw,
  isDark,
  mobile,
  reducedMotion,
  skin,
  logos,
  surfaceRef,
  onActivate,
  onOpenHref,
}: {
  ring: RingSpec
  yaw: YawController
  isDark: boolean
  mobile: boolean
  reducedMotion: boolean
  skin: Skin
  logos: string[]
  surfaceRef: RefObject<HTMLDivElement | null>
  onActivate: (index: number) => void
  onOpenHref: (href: string) => void
}) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const registry = useMemo(() => new Map<string, PanelHandle>(), [])
  const ground = useMemo(() => ({ value: skin.ground.clone() }), [skin])
  const [ready, setReady] = useState(false)
  const [shown, setShown] = useState<Shown | null>(null)

  const phase = useRef<"idle" | "out" | "swap" | "in">("idle")
  const progress = useRef(0)
  const latestRing = useRef(ring)
  const theme = useRef<PaintTheme | null>(null)
  const focusOrder = useRef<string[]>([])
  const enlarged = useRef<PanelHandle | null>(null)
  const cursor = useRef("")
  const anisotropy = useMemo(() => Math.min(gl.capabilities.getMaxAnisotropy(), 8), [gl])

  useEffect(() => {
    latestRing.current = ring
  }, [ring])

  useEffect(() => {
    let alive = true
    const t = readPaintTheme()
    theme.current = t
    Promise.all([ensureFonts(t), preloadLogos(logos)]).then(() => {
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [logos])

  useEffect(() => {
    theme.current = readPaintTheme()
  }, [isDark])

  // First formation, once fonts and logos are in.
  useEffect(() => {
    if (!ready || shown) return
    setShown({ ring: latestRing.current, anchor: yaw.theta, instance: 0 })
  }, [ready, shown, yaw])

  // A new ring was asked for: dissolve the current one first.
  useEffect(() => {
    if (!shown || shown.ring.key === ring.key || phase.current === "out" || phase.current === "swap") return
    phase.current = "out"
    progress.current = 0
    yaw.locked = true
    for (const h of registry.values()) h.visFrom = h.vis
  }, [ring.key, shown, yaw, registry])

  const makeTexture = (h: PanelHandle, tier: Tier): PanelTexture | null => {
    const t = theme.current
    if (!t) return null
    const { canvas, regions } = paintPanel(h.spec.content, h.spec.size, t, textureWidth(h.spec.size, tier, mobile))
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = anisotropy
    texture.premultiplyAlpha = true
    texture.needsUpdate = true
    return { texture, regions, tier, dark: t.isDark }
  }

  const show = (h: PanelHandle, tex: PanelTexture, crossfade: boolean) => {
    const u = h.material.uniforms
    if (crossfade && h.current && !reducedMotion) {
      h.outgoing?.texture.dispose()
      h.outgoing = h.current
      u.uMapA.value = h.outgoing.texture
      u.uMix.value = 0
    } else {
      h.current?.texture.dispose()
      u.uMapA.value = tex.texture
      u.uMix.value = 0
    }
    h.current = tex
    u.uMapB.value = tex.texture
  }

  // The new ring's panels have mounted and registered: paint them and turn the yaw stops over.
  useLayoutEffect(() => {
    if (!shown) return
    const angles = ringAngles(shown.ring, shown.anchor)
    focusOrder.current = []
    enlarged.current = null
    for (const h of registry.values()) {
      const tex = makeTexture(h, h.spec.size === "info" ? "focus" : "rest")
      if (tex) show(h, tex, false)
    }
    yaw.setStops(shown.ring.key, angles, shown.ring.wrap, shown.ring.focusIndex)
    yaw.locked = true
    phase.current = "in"
    progress.current = 0
    // Keyed on `shown` alone: re-running on the paint helpers' identity would repaint every render.
  }, [shown])

  useEffect(
    () => () => {
      yaw.locked = false
    },
    [yaw],
  )

  /**
   * Hit-tests the drawn (possibly enlarged) panels analytically. The camera is
   * at the centre, so a screen point is just an azimuth and an elevation.
   */
  const dir = useMemo(() => new THREE.Vector3(), [])
  const pickAt = (x: number, y: number): Hit | null => {
    if (phase.current !== "idle") return null
    const rect = gl.domElement.getBoundingClientRect()
    const ndcX = ((x - rect.left) / rect.width) * 2 - 1
    const ndcY = -((y - rect.top) / rect.height) * 2 + 1
    const d = dir.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize()
    const azimuth = Math.atan2(d.x, -d.z)
    const tanElevation = d.y / Math.hypot(d.x, d.z)
    const handles = [...registry.values()].filter((h) => h.vis > 0.5).sort((a, b) => b.grow - a.grow)
    for (const h of handles) {
      const u = h.material.uniforms
      const s = u.uShrink.value as number
      const size = PANEL_SIZES[h.spec.size]
      const halfW = (size.w / ROOM_RADIUS / 2) * s
      const halfH = (size.h * s) / 2
      const da = wrapAngle(azimuth - h.angle)
      const py = (ROOM_RADIUS + (u.uLift.value as number)) * tanElevation
      if (Math.abs(da) > halfW || Math.abs(py) > halfH) continue
      const tx = (da / halfW + 1) / 2
      const ty = 0.5 - py / (2 * halfH)
      const region = h.current?.regions.find((r) => tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h)
      return { h, region }
    }
    return null
  }

  /** One paint per frame at most: theme repaints nearest-first, then the focus-tier pool. */
  const schedulePaint = () => {
    if (phase.current !== "idle") return
    const handles = [...registry.values()]
    const dist = (h: PanelHandle) => Math.abs(wrapAngle(h.angle - yaw.theta))

    const stale = handles.filter((h) => h.current && h.current.dark !== isDark && !h.outgoing)
    if (stale.length) {
      stale.sort((a, b) => dist(a) - dist(b))
      const h = stale[0]
      const tex = makeTexture(h, h.current?.tier ?? "rest")
      if (tex) show(h, tex, true)
      return
    }

    const settled = !yaw.dragging && Math.abs(yaw.velocity) < 0.4
    const focused = settled ? handles.find((h) => h.index === yaw.focused) : undefined
    const upgrade = [enlarged.current, focused].find((h) => h && h.spec.size !== "info" && h.current?.tier === "rest")
    if (upgrade) {
      const tex = makeTexture(upgrade, "focus")
      if (tex) show(upgrade, tex, false)
      focusOrder.current = [upgrade.spec.id, ...focusOrder.current.filter((id) => id !== upgrade.spec.id)]
      return
    }

    const evict = focusOrder.current.slice(FOCUS_POOL)
    if (evict.length) {
      focusOrder.current = focusOrder.current.slice(0, FOCUS_POOL)
      const h = registry.get(evict[0])
      if (h && h.current?.tier === "focus") {
        const tex = makeTexture(h, "rest")
        if (tex) show(h, tex, false)
      }
    }
  }

  useFrame((_, dt) => {
    ground.value.copy(skin.ground)
    const theta = yaw.theta

    if (phase.current === "out" || phase.current === "in") {
      const dur = phase.current === "out" ? DISSOLVE_S : REFORM_S
      progress.current = reducedMotion ? 1 : progress.current + dt / dur
      const p = clamp01(progress.current)
      for (const h of registry.values()) {
        const delay = (Math.abs(wrapAngle(h.angle - theta)) / Math.PI) * RIPPLE
        const local = ease(clamp01((p - delay) / (1 - RIPPLE)))
        h.vis = phase.current === "out" ? h.visFrom * (1 - local) : local
      }
      if (progress.current >= 1) {
        if (phase.current === "out") {
          phase.current = "swap"
          setShown((s) => ({ ring: latestRing.current, anchor: yaw.theta, instance: (s?.instance ?? 0) + 1 }))
        } else {
          phase.current = "idle"
          yaw.locked = false
        }
      }
    }

    // Enlarge whatever the pointer is over; without a hovering pointer
    // (touch, keyboard), enlarge the panel in front instead.
    const hit = yaw.pointer.inside && !yaw.dragging ? pickAt(yaw.pointer.x, yaw.pointer.y) : null
    const keyboard = (document.activeElement as HTMLElement | null)?.dataset?.panelIndex !== undefined
    const settled = !yaw.dragging && Math.abs(yaw.velocity) < 0.4
    let target = hit?.h ?? null
    if (!target && (mobile || keyboard) && settled && phase.current === "idle") {
      target = [...registry.values()].find((h) => h.index === yaw.focused) ?? null
    }
    if (target && GROW[target.spec.size] === 0) target = null
    enlarged.current = target

    const el = surfaceRef.current
    const want = hit && (hit.region || hit.h.spec.openable || hit.h.index !== yaw.focused) ? "pointer" : ""
    if (el && want !== cursor.current) {
      cursor.current = want
      el.style.cursor = want
    }

    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 12)
    for (const h of registry.values()) {
      h.grow += ((h === target ? 1 : 0) - h.grow) * k
      const u = h.material.uniforms
      const d = Math.abs(wrapAngle(h.angle - theta))
      const near = h.spec.size === "info" ? 1 : 1 - ease(clamp01((d - 0.25) / 0.45))
      u.uFocus.value = Math.max(near, h.grow)
      u.uOpacity.value = h.vis
      u.uShrink.value = (0.82 + 0.18 * h.vis) * (1 + GROW[h.spec.size] * h.grow)
      u.uLift.value = (1 - h.vis) * 0.9 - HOVER_LIFT * h.grow
      h.mesh.renderOrder = h.grow > 0.001 ? 1 : 0
      if (h.outgoing) {
        u.uMix.value = Math.min(1, u.uMix.value + dt / CROSSFADE_S)
        if (u.uMix.value >= 1) {
          h.outgoing.texture.dispose()
          h.outgoing = null
          u.uMapA.value = h.current?.texture ?? null
          u.uMix.value = 0
        }
      }
    }

    schedulePaint()
  })

  // Taps: open a panel (or a link painted on it). Touch has no hover preview,
  // so there a first tap on a side panel turns to it instead.
  useEffect(() => {
    yaw.onTap = (x, y) => {
      const p = pickAt(x, y)
      if (!p) return
      if (mobile && p.h.index !== yaw.focused) {
        yaw.goTo(p.h.index, yaw.ringKey)
        return
      }
      if (p.region) onOpenHref(p.region.href)
      else if (p.h.spec.openable || p.h.spec.href) onActivate(p.h.index)
      else yaw.goTo(p.h.index, yaw.ringKey)
    }
    return () => {
      yaw.onTap = undefined
    }
  })

  if (!shown) return null
  const angles = ringAngles(shown.ring, shown.anchor)
  return (
    <group>
      {shown.ring.panels.map((spec, i) => (
        <Panel
          key={`${shown.instance}-${spec.id}`}
          spec={spec}
          index={i}
          angle={angles[i]}
          registry={registry}
          ground={ground}
        />
      ))}
    </group>
  )
}
