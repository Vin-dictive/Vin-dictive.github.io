"use client"

import { useCallback, useMemo, useState } from "react"
import * as THREE from "three"

/** Every value the room's look depends on; lerped per frame toward the active skin. */
export interface Skin {
  ground: THREE.Color
  accent: THREE.Color
  /** Dot-grid colour (`--folio-dot-grid`) and base alpha, as in CursorDotBackground. */
  dot: THREE.Color
  dotAlpha: number
  /** Cursor glow alpha at its centre and at 38% of its radius. */
  glowNear: number
  glowFar: number
  bloomIntensity: number
  bloomThreshold: number
  vignette: number
  grain: number
  chroma: number
}

function readColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.body).getPropertyValue(name).trim()
  const [r, g, b] = raw.split(/\s+/).map(Number)
  return [r, g, b].every((n) => Number.isFinite(n)) ? new THREE.Color(`rgb(${r},${g},${b})`) : new THREE.Color(fallback)
}

function skinFor(isDark: boolean): Skin {
  const accent = readColor("--folio-primary", "#ff8e83")
  const dot = readColor("--folio-dot-grid", isDark ? "#ffffff" : "#000000")
  return isDark
    ? {
        ground: new THREE.Color("#0e0e0e"),
        accent,
        dot,
        dotAlpha: 0.52,
        glowNear: 0.32,
        glowFar: 0.1,
        bloomIntensity: 0.9,
        bloomThreshold: 0.55,
        vignette: 0.35,
        grain: 0.035,
        chroma: 0.0006,
      }
    : {
        ground: new THREE.Color("#faf8f6"),
        accent,
        dot,
        dotAlpha: 0.34,
        glowNear: 0.2,
        glowFar: 0.065,
        bloomIntensity: 0.25,
        bloomThreshold: 0.85,
        vignette: 0.15,
        grain: 0.015,
        chroma: 0,
      }
}

const COLORS = ["ground", "accent", "dot"] as const
const SCALARS = ["dotAlpha", "glowNear", "glowFar", "bloomIntensity", "bloomThreshold", "vignette", "grain", "chroma"] as const

/**
 * Theme → uniform plumbing. `current` is mutated in place by `advance()` so
 * consumers can read it every frame without re-rendering.
 */
export function useRoomSkin(isDark: boolean) {
  const [current] = useState(() => skinFor(isDark))
  const target = useMemo(() => skinFor(isDark), [isDark])

  const advance = useCallback(
    (dt: number, instant: boolean) => {
      const k = instant ? 1 : 1 - Math.exp(-dt * 7)
      for (const key of COLORS) current[key].lerp(target[key], k)
      for (const key of SCALARS) current[key] += (target[key] - current[key]) * k
    },
    [current, target],
  )

  return { current, advance }
}
