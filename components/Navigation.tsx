"use client"

import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Award,
  Briefcase,
  FileText,
  FolderKanban,
  Home,
  Mail,
  Menu,
  User,
  X,
} from "lucide-react"
import { ThemeToggleButton } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

const NAV: readonly { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "about", label: "About", Icon: User },
  { id: "experience", label: "Experience", Icon: Briefcase },
  { id: "projects", label: "Projects", Icon: FolderKanban },
  { id: "certifications", label: "Certs", Icon: Award },
  { id: "contact", label: "Contact", Icon: Mail },
] as const

const NAV_IDS = new Set(NAV.map((item) => item.id))

function navIdFromHash(hash: string): string {
  const id = hash.replace(/^#/, "")
  return NAV_IDS.has(id) ? id : NAV[0].id
}

const DEFAULT_RESUME_URL =
  "https://github.com/Vin-dictive/cv-latex/blob/main/cv.pdf"

const navLinkBase =
  "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors sm:px-3 sm:text-sm"

const navActionPill =
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-folio-on-surface/15 bg-folio-surface-highest/40 px-3 text-xs font-bold uppercase tracking-wider text-folio-on-surface shadow-sm backdrop-blur-sm transition-colors hover:border-folio-primary hover:bg-folio-primary/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-folio-primary dark:hover:bg-folio-primary/25 sm:px-4"

export default function Navigation({
  resumeUrl = DEFAULT_RESUME_URL,
}: {
  resumeUrl?: string
}) {
  const [active, setActive] = useState("home")
  const [open, setOpen] = useState(false)
  /** While true, scroll-driven updates are skipped so smooth #nav jumps keep the correct highlight. */
  const hashNavLockRef = useRef(false)
  /** Browser timers are numeric IDs; avoid NodeJS.Timeout from `setTimeout` typing. */
  const hashUnlockTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const basePath = () =>
      `${window.location.pathname}${window.location.search}`

    const probeFromScrollPadding = () => {
      const raw = getComputedStyle(document.documentElement).scrollPaddingTop
      const n = parseFloat(raw)
      return Number.isFinite(n) ? Math.round(n) : 112
    }

    const syncFromHashOnly = () => {
      setActive(navIdFromHash(window.location.hash))
    }

    const syncFromScroll = () => {
      const probe = probeFromScrollPadding()
      let current = NAV[0].id
      for (const { id } of NAV) {
        const el = document.getElementById(id)
        if (!el) continue
        const { top } = el.getBoundingClientRect()
        if (top <= probe) {
          current = id
        }
      }

      setActive(current)

      if (current === NAV[0].id && window.scrollY < 8) {
        if (window.location.hash) {
          window.history.replaceState(window.history.state, "", basePath())
        }
      } else if (window.location.hash !== `#${current}`) {
        window.history.replaceState(
          window.history.state,
          "",
          `${basePath()}#${current}`
        )
      }
    }

    const clearHashNavLock = () => {
      hashNavLockRef.current = false
      if (hashUnlockTimerRef.current !== undefined) {
        clearTimeout(hashUnlockTimerRef.current)
        hashUnlockTimerRef.current = undefined
      }
      syncFromScroll()
    }

    const onHashChange = () => {
      hashNavLockRef.current = true
      if (hashUnlockTimerRef.current !== undefined) {
        clearTimeout(hashUnlockTimerRef.current)
      }
      syncFromHashOnly()
      hashUnlockTimerRef.current = window.setTimeout(clearHashNavLock, 750)
    }

    const onScroll = () => {
      if (hashNavLockRef.current) return
      syncFromScroll()
    }

    const onScrollEnd = () => {
      if (!hashNavLockRef.current) return
      clearHashNavLock()
    }

    syncFromHashOnly()
    const initialSync = requestAnimationFrame(() => {
      syncFromScroll()
    })

    window.addEventListener("hashchange", onHashChange)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    window.addEventListener("scrollend", onScrollEnd as EventListener)

    return () => {
      cancelAnimationFrame(initialSync)
      if (hashUnlockTimerRef.current !== undefined) {
        clearTimeout(hashUnlockTimerRef.current)
      }
      window.removeEventListener("hashchange", onHashChange)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("scrollend", onScrollEnd as EventListener)
    }
  }, [])

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4"
      aria-label="Primary"
    >
      <div className="pointer-events-auto w-full max-w-screen-2xl overflow-hidden rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/35 shadow-xl shadow-folio-surface/10 backdrop-blur-2xl transition-[box-shadow] dark:border-white/10 dark:bg-zinc-950/40 dark:shadow-black/40 md:backdrop-blur-3xl">
        {/* Desktop + mobile header row */}
        <div className="relative flex h-14 w-full items-center px-3 sm:h-16 sm:px-5">
          {/* Spacer balances center cluster on large screens */}
          <div className="hidden w-[min(11rem,22vw)] shrink-0 lg:block" aria-hidden />

          {/* Centered nav — desktop only */}
          <div className="absolute left-1/2 top-1/2 hidden max-w-[min(100%-10rem,56rem)] -translate-x-1/2 -translate-y-1/2 lg:flex lg:items-center lg:justify-center">
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 xl:gap-x-2">
              {NAV.map((item) => {
                const Icon = item.Icon
                const isActive = active === item.id
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      navLinkBase,
                      "group/navlink",
                      isActive
                        ? "text-folio-primary dark:text-folio-primary"
                        : "text-folio-on-surface-variant hover:text-folio-primary dark:text-zinc-400 dark:hover:text-folio-primary"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-folio-primary"
                          : "opacity-80 group-hover/navlink:text-folio-primary group-hover/navlink:opacity-100"
                      )}
                      aria-hidden
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Actions: mobile uses ms-auto; desktop right column */}
          <div className="ms-auto flex items-center gap-2 sm:gap-2.5 lg:ms-0 lg:flex-1 lg:justify-end">
            <ThemeToggleButton />
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(navActionPill, "min-w-0")}
              aria-label="Open resume PDF"
            >
              <FileText className="h-4 w-4 shrink-0" aria-hidden />
              <span className="max-[380px]:sr-only">Resume</span>
            </a>
            <button
              type="button"
              className={cn(
                navActionPill,
                "w-10 px-0 sm:w-11 lg:hidden",
                open &&
                  "border-folio-primary bg-folio-primary/10 dark:border-folio-primary dark:bg-folio-primary/20"
              )}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {open ? (
          <div className="border-t border-folio-outline-variant/15 bg-folio-surface-highest/30 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/35 lg:hidden">
            <div className="mx-auto flex max-w-md flex-col gap-1">
              {NAV.map((item) => {
                const Icon = item.Icon
                const isActive = active === item.id
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold uppercase tracking-wide transition-colors",
                      isActive
                        ? "bg-folio-primary/10 text-folio-primary dark:bg-folio-primary/20 dark:text-folio-primary"
                        : "text-folio-on-surface hover:bg-folio-primary/10 hover:text-folio-primary dark:text-zinc-300 dark:hover:bg-folio-primary/20 dark:hover:text-folio-primary"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-folio-outline-variant/20 dark:border-white/10",
                        isActive && "border-folio-primary bg-folio-primary/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-folio-primary" : "opacity-80"
                        )}
                        aria-hidden
                      />
                    </span>
                    {item.label}
                  </a>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
