"use client"

import { useEffect, useState, type RefObject } from "react"
import { wrapAngle } from "./layout"

export const CAMERA_FOV = 42

/** Fraction of velocity left after one second of free spin. */
const DAMPING = 0.0015
const DECAY = -Math.log(DAMPING)
/** Natural frequency of the critically damped snap spring, rad/s. */
const SPRING = 9
const WHEEL_RAD_PER_PX = 0.0016
const WHEEL_FOLLOW = 18
const WHEEL_IDLE_MS = 140
const TAP_SLOP_PX = 6
/** A gesture that travels this fraction of the gap to the next panel commits to it. */
const COMMIT = 0.12

type Mode = "spring" | "drag" | "wheel"

/**
 * Yaw (horizontal turn) controller. `theta` is the only source of truth for
 * where the camera looks; it lives here, outside React, and is advanced by
 * `step()` from the render loop.
 */
export class YawController {
  theta = 0
  velocity = 0
  stops: number[] = [0]
  ringKey = ""
  wrap = true
  /** Ignores input while the wall is dissolving / re-forming. */
  locked = false
  reducedMotion = false
  focused = 0
  /** Radians per CSS px of pointer travel, so dragging feels like grabbing the wall. */
  radPerPx = 0.0015

  /** Last hovering pointer position; `inside` is false for touch and once it leaves. */
  pointer = { x: 0, y: 0, inside: false }

  onFocusChange?: (index: number) => void
  onTap?: (clientX: number, clientY: number) => void

  private mode: Mode = "spring"
  private target = 0
  private wheelTarget = 0
  private lastInput = 0
  private gestureStart = 0
  private gestureFrom = 0
  private pointerId: number | null = null
  private pointerStartX = 0
  private pointerLastX = 0
  private pointerLastT = 0
  private pointerTravel = 0

  get dragging() {
    return this.mode === "drag"
  }

  nearest(angle: number) {
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < this.stops.length; i++) {
      const d = Math.abs(wrapAngle(this.stops[i] - angle))
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return best
  }

  private neighbor(i: number, dir: number) {
    const n = this.stops.length
    const j = i + dir
    if (this.wrap) return ((j % n) + n) % n
    return j < 0 || j >= n ? i : j
  }

  private aimAt(i: number) {
    this.target = this.theta + wrapAngle(this.stops[i] - this.theta)
    this.mode = "spring"
    if (this.reducedMotion) {
      this.theta = this.target
      this.velocity = 0
    }
  }

  /** Replaces the panel stops (a new ring formed) and faces `focusIndex`. */
  setStops(ringKey: string, angles: number[], wrap: boolean, focusIndex: number) {
    this.ringKey = ringKey
    this.stops = angles
    this.wrap = wrap
    this.aimAt(focusIndex)
    this.focused = focusIndex
    this.onFocusChange?.(focusIndex)
  }

  /** Turns to panel `i` of ring `ringKey`; ignored if that ring has not formed yet. */
  goTo(i: number, ringKey: string) {
    if (ringKey !== this.ringKey || i < 0 || i >= this.stops.length) return
    this.aimAt(i)
  }

  /** Steps one panel left (-1) or right (+1); returns the panel it is heading to. */
  stepBy(dir: -1 | 1) {
    const from = this.mode === "spring" ? this.nearest(this.target) : this.nearest(this.theta)
    if (this.locked) return from
    const to = this.neighbor(from, dir)
    if (to === from) return from
    this.target += wrapAngle(this.stops[to] - this.target)
    this.mode = "spring"
    if (this.reducedMotion) {
      this.theta = this.target
      this.velocity = 0
    }
    return to
  }

  private beginGesture() {
    this.gestureStart = this.theta
    this.gestureFrom = this.nearest(this.theta)
  }

  private release(projected: number) {
    let i = this.nearest(projected)
    const moved = wrapAngle(projected - this.gestureStart)
    if (i === this.gestureFrom && this.stops.length > 1) {
      const dir = moved > 0 ? 1 : -1
      const next = this.neighbor(i, dir)
      const gap = Math.abs(wrapAngle(this.stops[next] - this.stops[i]))
      if (next !== i && Math.abs(moved) > gap * COMMIT) i = next
    }
    this.aimAt(i)
  }

  step(dt: number) {
    dt = Math.min(dt, 1 / 20)
    const now = performance.now()

    if (this.mode === "wheel") {
      const prev = this.theta
      const k = this.reducedMotion ? 1 : 1 - Math.exp(-dt * WHEEL_FOLLOW)
      this.theta += (this.wheelTarget - this.theta) * k
      this.velocity = dt > 0 ? (this.theta - prev) / dt : 0
      if (now - this.lastInput > WHEEL_IDLE_MS) this.release(this.wheelTarget)
    } else if (this.mode === "spring") {
      if (this.reducedMotion) {
        this.theta = this.target
        this.velocity = 0
      } else {
        const sub = Math.max(1, Math.ceil(dt / (1 / 120)))
        const h = dt / sub
        for (let s = 0; s < sub; s++) {
          const a = SPRING * SPRING * (this.target - this.theta) - 2 * SPRING * this.velocity
          this.velocity += a * h
          this.theta += this.velocity * h
        }
        if (Math.abs(this.target - this.theta) < 1e-5 && Math.abs(this.velocity) < 1e-4) {
          this.theta = this.target
          this.velocity = 0
        }
      }
    }

    const f = this.nearest(this.theta)
    if (f !== this.focused && !this.locked) {
      this.focused = f
      this.onFocusChange?.(f)
    }
  }

  pointerDown(e: PointerEvent, el: HTMLElement) {
    if (this.locked || this.pointerId !== null) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    this.pointerId = e.pointerId
    el.setPointerCapture(e.pointerId)
    this.mode = "drag"
    this.velocity = 0
    this.pointerStartX = e.clientX
    this.pointerLastX = e.clientX
    this.pointerLastT = performance.now()
    this.pointerTravel = 0
    this.beginGesture()
  }

  pointerMove(e: PointerEvent) {
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    this.pointer.inside = e.pointerType !== "touch"
    if (this.pointerId !== e.pointerId || this.mode !== "drag") return
    const now = performance.now()
    const dx = e.clientX - this.pointerStartX
    this.pointerTravel = Math.max(this.pointerTravel, Math.abs(dx))
    this.theta = this.gestureStart - dx * this.radPerPx
    const dtMs = Math.max(1, now - this.pointerLastT)
    const instant = (-(e.clientX - this.pointerLastX) * this.radPerPx * 1000) / dtMs
    this.velocity = this.velocity * 0.25 + instant * 0.75
    this.pointerLastX = e.clientX
    this.pointerLastT = now
  }

  pointerUp(e: PointerEvent, el: HTMLElement, cancelled: boolean) {
    if (this.pointerId !== e.pointerId) return
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    this.pointerId = null
    if (this.mode !== "drag") return
    // Holding still before letting go means "stop here", not "fling".
    if (performance.now() - this.pointerLastT > 80) this.velocity = 0
    const tapped = !cancelled && this.pointerTravel < TAP_SLOP_PX
    if (tapped) {
      this.velocity = 0
      this.aimAt(this.nearest(this.theta))
      this.onTap?.(e.clientX, e.clientY)
      return
    }
    this.release(this.theta + this.velocity / DECAY)
  }

  wheel(e: WheelEvent) {
    e.preventDefault()
    // Trackpad pinch arrives as ctrl+wheel; swallowing it stops page zoom.
    if (this.locked || e.ctrlKey || this.mode === "drag") return
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit
    if (this.mode !== "wheel") {
      this.beginGesture()
      this.wheelTarget = this.theta
      this.mode = "wheel"
    }
    this.wheelTarget += delta * WHEEL_RAD_PER_PX
    this.lastInput = performance.now()
  }
}

/** Creates the controller and wires pointer, touch and wheel input on `surfaceRef`. */
export function useYaw(surfaceRef: RefObject<HTMLElement | null>) {
  const [yaw] = useState(() => new YawController())

  useEffect(() => {
    const el = surfaceRef.current
    if (!el) return

    const measure = () => {
      const w = el.clientWidth || window.innerWidth
      const h = el.clientHeight || window.innerHeight
      const half = ((CAMERA_FOV / 2) * Math.PI) / 180
      const hfov = 2 * Math.atan(Math.tan(half) * (w / h))
      yaw.radPerPx = hfov / w
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const readMotion = () => {
      yaw.reducedMotion = mq.matches
    }

    const down = (e: PointerEvent) => yaw.pointerDown(e, el)
    const move = (e: PointerEvent) => yaw.pointerMove(e)
    const up = (e: PointerEvent) => yaw.pointerUp(e, el, false)
    const cancel = (e: PointerEvent) => yaw.pointerUp(e, el, true)
    const wheel = (e: WheelEvent) => yaw.wheel(e)
    const leave = () => {
      yaw.pointer.inside = false
    }

    measure()
    readMotion()
    el.addEventListener("pointerdown", down)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", cancel)
    el.addEventListener("wheel", wheel, { passive: false })
    el.addEventListener("pointerleave", leave)
    window.addEventListener("resize", measure)
    mq.addEventListener("change", readMotion)

    return () => {
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", cancel)
      el.removeEventListener("wheel", wheel)
      el.removeEventListener("pointerleave", leave)
      window.removeEventListener("resize", measure)
      mq.removeEventListener("change", readMotion)
    }
  }, [surfaceRef, yaw])

  return yaw
}
