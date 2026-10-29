"use client"

import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react"
import { ViewToggle } from "@/components/Navigation"
import { ThemeToggleButton } from "@/components/ThemeToggle"
import { useIsDark } from "@/lib/useTheme"
import { cn } from "@/lib/utils"
import { buildRing, pad2, sectionCount, sectionStart, SECTIONS, type RoomData, type SectionId } from "./layout"
import { useYaw } from "./useYaw"

const RoomCanvas = dynamic(() => import("./RoomCanvas"), {
  ssr: false,
  loading: () => <RoomStatus>Building the room…</RoomStatus>,
})

const label = "technical-label text-[10px] font-bold uppercase tracking-[0.16em]"

const control =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-folio-on-surface/15 bg-folio-surface-highest/40 px-3 text-folio-on-surface shadow-sm backdrop-blur-sm transition-colors hover:border-folio-primary hover:text-folio-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folio-primary dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100"

const ROOM_LABEL =
  "Vinay Valson's work on the inside of a round room. Drag or scroll to turn; open an item to see its pieces all the way round."
const NO_WEBGL_LABEL = "This view needs WebGL2, which this browser has turned off."

function RoomStatus({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className={cn(label, "text-folio-on-surface-variant")}>{children}</p>
    </div>
  )
}

function NoWebGL() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className={cn(label, "text-folio-primary")}>Room view unavailable</p>
      <p className="max-w-sm text-sm leading-relaxed text-folio-on-surface-variant">{NO_WEBGL_LABEL}</p>
      <Link href="/" className={cn(control, label)}>
        Back to the page view
      </Link>
    </div>
  )
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <NoWebGL /> : this.props.children
  }
}

function openHref(href: string) {
  if (href.startsWith("mailto:")) window.location.href = href
  else window.open(href, "_blank", "noopener,noreferrer")
}

interface View {
  /** Index of the drilled-into item in the room ring. */
  open: number | null
  /** Panel to face when the room ring (re-)forms. */
  entry: number
}

export default function RoomShell({ data }: { data: RoomData }) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const panelButtonsRef = useRef<(HTMLElement | null)[]>([])
  const isDark = useIsDark()
  const yaw = useYaw(surfaceRef)

  const [webgl, setWebgl] = useState<"pending" | "ok" | "none">("pending")
  const [view, setView] = useState<View>({ open: null, entry: 0 })
  const [focus, setFocus] = useState<{ ring: string; index: number }>({ ring: "", index: 0 })
  const [announcement, setAnnouncement] = useState("")

  const ring = useMemo(() => buildRing(data, view.open, view.entry), [data, view.open, view.entry])
  const focusedIndex = focus.ring === ring.key ? focus.index : ring.focusIndex
  const focusedPanel = ring.panels[focusedIndex] ?? ring.panels[0]
  const activeSection = focusedPanel.section
  const sectionLabel = SECTIONS.find((s) => s.id === activeSection)?.label ?? ""

  useEffect(() => {
    const ok = (() => {
      try {
        return !!document.createElement("canvas").getContext("webgl2")
      } catch {
        return false
      }
    })()
    // Detection needs the DOM, so it cannot run during the static prerender.
    setWebgl(ok ? "ok" : "none")
  }, [])

  useEffect(() => {
    yaw.onFocusChange = (index) => setFocus({ ring: yaw.ringKey, index })
    return () => {
      yaw.onFocusChange = undefined
    }
  }, [yaw])

  useEffect(() => {
    const id = window.setTimeout(() => setAnnouncement(focusedPanel.label), 250)
    return () => window.clearTimeout(id)
  }, [focusedPanel.label])

  const activate = useCallback(
    (index: number) => {
      const panel = ring.panels[index]
      if (!panel) return
      if (panel.openable) setView((v) => ({ ...v, open: index, entry: 0 }))
      else if (panel.href) openHref(panel.href)
    },
    [ring],
  )

  const close = useCallback(() => {
    setView((v) => (v.open === null ? v : { ...v, open: null, entry: v.open }))
  }, [])

  /** Every section shares the wall, so picking one turns to its first panel. */
  const selectSection = useCallback(
    (section: SectionId) => {
      const start = sectionStart(data, section)
      if (view.open !== null) setView({ open: null, entry: start })
      else yaw.goTo(start, ring.key)
    },
    [data, view.open, yaw, ring.key],
  )

  // Opening moves focus to "↑ All …"; closing returns it to the item that was opened.
  const prevOpen = useRef<number | null>(null)
  useEffect(() => {
    const was = prevOpen.current
    prevOpen.current = view.open
    if (was === view.open) return
    if (view.open !== null) backRef.current?.focus({ preventScroll: true })
    else if (was !== null) panelButtonsRef.current[was]?.focus({ preventScroll: true })
  }, [view.open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey || e.defaultPrevented) return
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()
        const to = yaw.stepBy(e.key === "ArrowLeft" ? -1 : 1)
        const active = document.activeElement as HTMLElement | null
        if (active?.dataset.panelIndex !== undefined) {
          panelButtonsRef.current[to]?.focus({ preventScroll: true })
        }
      } else if ((e.key === "Escape" || e.key === "ArrowUp") && view.open !== null) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [yaw, view.open, close])

  const multi = ring.panels.length > 1

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-folio-surface">
      <div
        ref={surfaceRef}
        role="img"
        aria-label={webgl === "none" ? NO_WEBGL_LABEL : ROOM_LABEL}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
      >
        {webgl === "ok" ? (
          <CanvasBoundary>
            <RoomCanvas
              data={data}
              ring={ring}
              yaw={yaw}
              isDark={isDark}
              surfaceRef={surfaceRef}
              onActivate={activate}
              onOpenHref={openHref}
            />
          </CanvasBoundary>
        ) : null}
      </div>
      {webgl === "none" ? <NoWebGL /> : null}

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-3 bg-gradient-to-b from-folio-surface/85 to-transparent px-3 sm:gap-6 sm:px-6">
        <Link
          href="/"
          className="technical-label pointer-events-auto hidden text-lg font-bold uppercase tracking-[0.03em] text-folio-on-surface transition-colors hover:text-folio-primary focus-visible:outline-2 focus-visible:outline-folio-primary md:block"
        >
          {data.personal.name}
        </Link>
        <nav aria-label="Room sections" className="pointer-events-auto flex items-center gap-0.5">
          {SECTIONS.map((s) => {
            const active = activeSection === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSection(s.id)}
                aria-current={active ? "location" : undefined}
                className={cn(
                  label,
                  "relative min-h-11 rounded-md px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-folio-primary sm:px-3",
                  active ? "text-folio-primary" : "text-folio-on-surface-variant hover:text-folio-on-surface",
                )}
              >
                {s.label}
                {active ? (
                  <span aria-hidden className="absolute inset-x-3 bottom-2 h-px bg-folio-primary" />
                ) : null}
              </button>
            )
          })}
        </nav>
        <div className="pointer-events-auto ml-auto flex items-center gap-1.5 sm:gap-2">
          <ViewToggle />
          <ThemeToggleButton />
        </div>
      </header>

      {webgl === "ok" ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 p-3 sm:p-6">
          <div className="pointer-events-auto flex min-w-0 flex-col items-start gap-2">
            {view.open !== null ? (
              <button ref={backRef} type="button" onClick={close} className={cn(control, label)}>
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                Back to room
              </button>
            ) : activeSection === "info" ? (
              <ul className="flex flex-wrap gap-2">
                {data.contacts.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className={cn(control, label)}
                    >
                      {c.label}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {multi ? (
              <p aria-hidden className={cn(label, "hidden max-w-[60vw] truncate text-folio-on-surface-variant sm:block")}>
                {view.open === null ? `${sectionLabel} ` : null}
                <span className="text-folio-primary">{pad2(focusedPanel.local + 1)}</span>
                {" / "}
                {pad2(view.open === null ? sectionCount(data, activeSection) : ring.panels.length)}
                <span className="mx-2 opacity-50">·</span>
                {view.open === null ? "Drag, scroll or ← → to turn · hover to enlarge, click to open" : "Esc or ↑ to go back"}
              </p>
            ) : null}
          </div>
          {multi ? (
            <div className="pointer-events-auto flex gap-2">
              <button type="button" onClick={() => yaw.stepBy(-1)} className={control} aria-label="Turn left">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={() => yaw.stepBy(1)} className={control} aria-label="Turn right">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {webgl === "ok" ? (
        <div role="group" aria-label={view.open === null ? "Room panels" : "Item facets"}>
          {ring.panels.map((panel, i) => {
            const cls = cn(
              control,
              label,
              "sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:bottom-24 focus-visible:left-1/2 focus-visible:z-50 focus-visible:-translate-x-1/2 focus-visible:whitespace-nowrap",
            )
            const common = {
              ref: (el: HTMLElement | null) => {
                panelButtonsRef.current[i] = el
              },
              "data-panel-index": i,
              onFocus: () => yaw.goTo(i, ring.key),
              className: cls,
            }
            return panel.href ? (
              <a key={panel.id} {...common} href={panel.href} target="_blank" rel="noopener noreferrer">
                {panel.label}
              </a>
            ) : (
              <button
                key={panel.id}
                {...common}
                type="button"
                onClick={() => activate(i)}
                aria-label={panel.openable ? `${panel.label}. Open` : panel.label}
              >
                {panel.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}
