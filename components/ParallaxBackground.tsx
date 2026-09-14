'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Scroll-linked parallax backdrop for a full-height section.
 *
 * Render as the first child of a section that has `relative isolate` on it.
 * The photo is oversized vertically and slides at a fraction of scroll speed;
 * a theme-aware scrim keeps foreground text and glass panels readable, and
 * `.parallax-fade` (globals.css) melts the edges into the dot-grid surface
 * between sections. Motion is disabled under prefers-reduced-motion.
 */
export default function ParallaxBackground({
  src,
  priority = false,
  intensity = 'soft',
}: {
  src: string
  /** Eager-load (hero section only). */
  priority?: boolean
  /** 'soft' keeps the photo as a quiet texture; 'bold' lets more of it through. */
  intensity?: 'soft' | 'bold'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // The image sits in a wrapper 36% taller than the section (-inset-y-[18%]),
  // so a ±10% translate of the wrapper never exposes its edges.
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <div ref={ref} aria-hidden className="parallax-fade absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        style={reducedMotion ? undefined : { y }}
        className="absolute inset-x-0 -inset-y-[18%] will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Theme-aware scrim: washes the photo back so content stays legible */}
      <div
        className={cn(
          'absolute inset-0',
          intensity === 'soft'
            ? 'bg-folio-surface/55 dark:bg-zinc-950/45'
            : 'bg-folio-surface/35 dark:bg-zinc-950/30',
        )}
      />
      {/* Depth gradient: slightly stronger toward the edges where headings sit */}
      <div className="absolute inset-0 bg-gradient-to-b from-folio-surface/45 via-transparent to-folio-surface/45 dark:from-zinc-950/50 dark:via-transparent dark:to-zinc-950/50" />
    </div>
  )
}
