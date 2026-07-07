"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Award,
  Briefcase,
  FileText,
  FolderKanban,
  Home,
  ImageIcon,
  Mail,
  User,
} from "lucide-react"
import { ThemeToggleButton } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

const GALLERY_PATH = "/gallery/"

type NavItem = {
  id: string
  label: string
  Icon: LucideIcon
  kind: "hash" | "route"
}

const NAV: readonly NavItem[] = [
  { id: "home", label: "Home", Icon: Home, kind: "hash" },
  { id: "about", label: "About", Icon: User, kind: "hash" },
  { id: "experience", label: "Experience", Icon: Briefcase, kind: "hash" },
  { id: "projects", label: "Projects", Icon: FolderKanban, kind: "hash" },
  { id: "certifications", label: "Certs", Icon: Award, kind: "hash" },
  { id: "contact", label: "Contact", Icon: Mail, kind: "hash" },
  { id: "gallery", label: "Gallery", Icon: ImageIcon, kind: "route" },
] as const

const HASH_NAV = NAV.filter((item) => item.kind === "hash")
const HASH_NAV_IDS = new Set(HASH_NAV.map((item) => item.id))

function isHomePath(pathname: string) {
  return pathname === "/" || pathname === ""
}

function navHref(item: NavItem, pathname: string) {
  if (item.kind === "route") return GALLERY_PATH
  const hash = `#${item.id}`
  return isHomePath(pathname) ? hash : `/${hash}`
}

function navIdFromHash(hash: string): string {
  const id = hash.replace(/^#/, "")
  return HASH_NAV_IDS.has(id) ? id : HASH_NAV[0].id
}

const DEFAULT_RESUME_URL = "/Vinay_Valson.pdf"

const navLinkBase =
  "relative inline-flex shrink-0 items-center justify-center transition-[color,background-color,border-color,box-shadow] duration-300 ease-out"

const navLinkInactive =
  "gap-1 rounded-full px-2 py-1 text-folio-on-surface-variant hover:bg-folio-surface-highest/35 hover:text-folio-primary sm:gap-1.5 sm:px-2.5 dark:text-zinc-400 dark:hover:bg-zinc-900/45 dark:hover:text-folio-primary"

const navLinkActive =
  "nav-link-active gap-1 rounded-full border px-2 py-1 text-folio-primary sm:gap-1.5 sm:px-2.5"

const navActionPill =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-folio-on-surface/15 bg-folio-surface-highest/40 px-2.5 text-[10px] font-bold uppercase tracking-wider text-folio-on-surface shadow-sm backdrop-blur-sm transition-colors hover:border-folio-primary hover:bg-folio-primary/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-folio-primary dark:hover:bg-folio-primary/25 sm:h-10 sm:px-3 sm:text-xs lg:px-4"

export default function Navigation({
  resumeUrl = DEFAULT_RESUME_URL,
}: {
  resumeUrl?: string
}) {
  const pathname = usePathname()
  const [active, setActive] = useState("home")
  const hashNavLockRef = useRef(false)
  const onGalleryPage = pathname.startsWith("/gallery")

  useEffect(() => {
    if (onGalleryPage) {
      setActive("gallery")
      return
    }

    let hashUnlockTimerId: number | undefined

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
      let current = HASH_NAV[0].id
      for (const { id } of HASH_NAV) {
        const el = document.getElementById(id)
        if (!el) continue
        const { top } = el.getBoundingClientRect()
        if (top <= probe) {
          current = id
        }
      }

      setActive(current)

      if (current === HASH_NAV[0].id && window.scrollY < 8) {
        if (window.location.hash) {
          window.history.replaceState(window.history.state, "", basePath())
        }
      } else if (window.location.hash !== `#${current}`) {
        window.history.replaceState(
          window.history.state,
          "",
          `${basePath()}#${current}`,
        )
      }
    }

    const clearHashNavLock = () => {
      hashNavLockRef.current = false
      if (hashUnlockTimerId !== undefined) {
        window.clearTimeout(hashUnlockTimerId)
        hashUnlockTimerId = undefined
      }
      syncFromScroll()
    }

    const onHashChange = () => {
      hashNavLockRef.current = true
      if (hashUnlockTimerId !== undefined) {
        window.clearTimeout(hashUnlockTimerId)
      }
      syncFromHashOnly()
      hashUnlockTimerId = window.setTimeout(clearHashNavLock, 750)
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
      if (hashUnlockTimerId !== undefined) {
        window.clearTimeout(hashUnlockTimerId)
      }
      window.removeEventListener("hashchange", onHashChange)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("scrollend", onScrollEnd as EventListener)
    }
  }, [onGalleryPage])

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4 xl:px-10 2xl:px-12"
      aria-label="Primary"
    >
      <div className="pointer-events-auto w-full max-w-[100rem] overflow-hidden rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/35 shadow-xl shadow-folio-surface/10 backdrop-blur-2xl transition-[box-shadow] dark:border-white/10 dark:bg-zinc-950/40 dark:shadow-black/40 md:backdrop-blur-3xl">
        <div className="flex h-14 w-full flex-nowrap items-center gap-2 px-2 sm:h-16 sm:gap-3 sm:px-4">
          <div className="nav-icon-row flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-1 overflow-x-auto sm:justify-center sm:gap-1.5 xl:gap-2">
            {NAV.map((item) => {
              const Icon = item.Icon
              const isActive = active === item.id
              return (
                <a
                  key={item.id}
                  href={navHref(item, pathname)}
                  title={item.label}
                  className={cn(
                    navLinkBase,
                    "group/navlink",
                    isActive ? navLinkActive : navLinkInactive,
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                >
                  {isActive ? (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-folio-primary/10 to-folio-primary/5 dark:from-white/10 dark:via-folio-primary/15 dark:to-folio-primary/5"
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      "relative h-3.5 w-3.5 shrink-0 transition-colors sm:h-4 sm:w-4",
                      isActive
                        ? "text-folio-primary"
                        : "opacity-80 group-hover/navlink:text-folio-primary group-hover/navlink:opacity-100",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "relative whitespace-nowrap text-[10px] font-semibold tracking-wide sm:text-[11px]",
                      isActive && "text-folio-primary",
                    )}
                  >
                    {item.label}
                  </span>
                </a>
              )
            })}
          </div>

          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
            <ThemeToggleButton />
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(navActionPill, "min-w-0")}
              aria-label="Open resume PDF"
              title="Resume"
            >
              <FileText className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Resume</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
