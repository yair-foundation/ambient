import * as React from "react"

/** A deliberately tiny History-API router: four routes don't need a dependency. */
const listeners = new Set<() => void>()

export function navigate(to: string) {
  if (to === window.location.pathname + window.location.search) return
  window.history.pushState({}, "", to)
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  window.addEventListener("popstate", l)
  return () => {
    listeners.delete(l)
    window.removeEventListener("popstate", l)
  }
}

export function usePath(): string {
  return React.useSyncExternalStore(subscribe, () => window.location.pathname)
}

export function Link({
  to,
  children,
  className,
  ...rest
}: { to: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
