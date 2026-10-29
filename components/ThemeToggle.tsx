"use client"

import { Moon, Sun } from "lucide-react"
import { useCallback } from "react"
import { useIsDark } from "@/lib/useTheme"
import { cn } from "@/lib/utils"

/** Matches glass nav actions (Resume, etc.). */
const navGlassToggle =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-folio-on-surface/15 bg-folio-surface-highest/40 text-folio-on-surface shadow-sm backdrop-blur-sm transition-colors hover:border-folio-primary hover:bg-folio-primary/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-folio-primary dark:hover:bg-folio-primary/25"

export function ThemeToggleButton({ className }: { className?: string }) {
  const isDark = useIsDark()

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
