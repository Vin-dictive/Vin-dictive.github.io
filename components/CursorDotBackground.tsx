"use client"

import { useEffect, useRef } from "react"

function parseRgbTriplet(s: string): readonly [number, number, number] {
  const p = s
    .trim()
    .split(/\s+/)
    .map((x) => Number(x))
  if (p.length >= 3 && p.every((n) => !Number.isNaN(n))) {
    return [p[0], p[1], p[2]] as const
  }
  return [255, 142, 131] as const
}

export default function CursorDotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const mouse = { x: -9999, y: -9999 }
    const smooth = { x: -9999, y: -9999 }
    let raf = 0
    let reducedMotion = false

    const size = { w: 0, h: 0, dpr: 1 }

    const readMotion = () => {
      reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }

    const readColors = () => {
      const root = getComputedStyle(document.documentElement)
      const isDark = document.documentElement.classList.contains("dark")
      /** Near-white grid dots; alpha is tuned per theme in draw() for contrast */
      const dotRaw = root.getPropertyValue("--folio-dot-grid").trim()
      const dot: readonly [number, number, number] =
        dotRaw.length > 0 ? parseRgbTriplet(dotRaw) : ([255, 255, 255] as const)
      return {
        surface: parseRgbTriplet(root.getPropertyValue("--folio-surface")),
        primary: parseRgbTriplet(root.getPropertyValue("--folio-primary")),
        dot,
        isDark,
      }
    }

    const resize = () => {
      readMotion()
      size.dpr = Math.min(window.devicePixelRatio || 1, 2)
      size.w = window.innerWidth
      size.h = window.innerHeight
      canvas.width = Math.floor(size.w * size.dpr)
      canvas.height = Math.floor(size.h * size.dpr)
      canvas.style.width = `${size.w}px`
      canvas.style.height = `${size.h}px`
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
    }

    const onMove = (clientX: number, clientY: number) => {
      mouse.x = clientX
      mouse.y = clientY
    }

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchstart", onTouchMove, { passive: true })
    const onTouchEnd = () => onMouseLeave()
    window.addEventListener("touchend", onTouchEnd)

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onMq = () => readMotion()
    mq.addEventListener("change", onMq)

    const grid = 34
    const influence = 240
    const maxShift = 20

    const draw = () => {
      readMotion()
      const { surface, primary, dot, isDark } = readColors()
      const [sr, sg, sb] = surface
      const [pr, pg, pb] = primary
      const [dr, dg, db] = dot

      const mx = mouse.x
      const my = mouse.y

      const lerp = reducedMotion ? 1 : 0.14
      if (smooth.x < -9000) {
        smooth.x = mx
        smooth.y = my
      } else {
        smooth.x += (mx - smooth.x) * lerp
        smooth.y += (my - smooth.y) * lerp
      }

      ctx.fillStyle = `rgb(${sr},${sg},${sb})`
      ctx.fillRect(0, 0, size.w, size.h)

      const sx = reducedMotion ? size.w * 0.5 : smooth.x
      const sy = reducedMotion ? size.h * 0.38 : smooth.y
      const glowOuter = Math.min(size.w, size.h) * 0.46
      const glowAlpha0 = isDark ? 0.32 : 0.2
      const glowAlpha1 = isDark ? 0.1 : 0.065

      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowOuter)
      grad.addColorStop(0, `rgba(${pr},${pg},${pb},${glowAlpha0})`)
      grad.addColorStop(0.38, `rgba(${pr},${pg},${pb},${glowAlpha1})`)
      grad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size.w, size.h)

      const inf = reducedMotion ? 0 : influence
      const maxS = reducedMotion ? 0 : maxShift

      const baseAlpha = isDark ? 0.52 : 0.34
      const cols = Math.ceil(size.w / grid) + 2
      const rows = Math.ceil(size.h / grid) + 2

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const bx = i * grid + grid * 0.5
          const by = j * grid + grid * 0.5
          const dx = bx - mx
          const dy = by - my
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          const f = inf <= 0 ? 0 : Math.max(0, 1 - d / inf)
          const ux = dx / d
          const uy = dy / d
          const ox = ux * f * maxS
          const oy = uy * f * maxS
          const px = bx + ox
          const py = by + oy
          const dotBoost = 0.62 + f * 0.85
          const radius = 1.45 + f * 1.45
          const a = Math.min(1, baseAlpha * dotBoost)
          /** Stronger orange wash on dots near cursor */
          const mix = f * 0.48
          const rr = Math.round(dr * (1 - mix) + pr * mix)
          const rg = Math.round(dg * (1 - mix) + pg * mix)
          const rb = Math.round(db * (1 - mix) + pb * mix)
          ctx.beginPath()
          ctx.arc(px, py, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rr},${rg},${rb},${a})`
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchstart", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      mq.removeEventListener("change", onMq)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden
    />
  )
}
