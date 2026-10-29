"use client"

import { useSyncExternalStore } from "react"

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

/** Theme lives on `<html class="dark">`, not in React; this subscribes to it. */
export function useIsDark() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
