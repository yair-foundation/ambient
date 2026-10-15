import * as React from "react"

type Appearance = "light" | "dark"
const KEY = "clientops-appearance"
const listeners = new Set<() => void>()

function read(): Appearance {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

/** Light/dark is the `.dark` class on <html> (DESIGN.md section 9). */
export function setAppearance(a: Appearance) {
  document.documentElement.classList.toggle("dark", a === "dark")
  try {
    localStorage.setItem(KEY, a)
  } catch {
    // storage may be unavailable
  }
  listeners.forEach((l) => l())
}

export function applyStoredAppearance() {
  document.documentElement.classList.toggle("dark", read() === "dark")
}

export function useAppearance(): Appearance {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light")
  )
}
