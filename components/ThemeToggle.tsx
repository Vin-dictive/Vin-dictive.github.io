"use client"

import { Moon, Sun } from "lucide-react"
import { useCallback, useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement
  const mo = new MutationObserver(onStoreChange)
  mo.observe(el, { attributes: true, attributeFilter: ["class"] })
  return () => mo.disconnect()
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark")
}

/** Default matches `theme` script in layout (dark when unset). */
function getServerSnapshot() {
  return true
}

/** Matches glass nav actions (Resume, etc.). */
const navGlassToggle =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-folio-on-surface/15 bg-folio-surface-highest/40 text-folio-on-surface shadow-sm backdrop-blur-sm transition-colors hover:border-folio-primary hover:bg-folio-primary/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-folio-primary dark:hover:bg-folio-primary/25"

export function ThemeToggleButton({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = useCallback(() => {
    const el = document.documentElement
    if (el.classList.contains("dark")) {
      el.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      el.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
  }, [])

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(navGlassToggle, className)}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  )
}
