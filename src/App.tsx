import { useEffect } from "react"

import { Assistant, AssistantProvider, useAssistant } from "@/components/ambient"
import { Icon } from "@/components/ui/icon"
import { Link, navigate, usePath } from "@/lib/router"
import { ambientApi } from "@/lib/ambient/api"
import { cn } from "@/lib/utils"
import { NAV } from "@/nav"
import DsPage from "@/ds/ds-page"
import Home from "@/pages/home"
import Renewals from "@/features/renewals/renewals"
import TriageQueue from "@/features/triage-queue/triage-queue"

function pageFor(path: string) {
  return NAV.find((n) => n.path === path) ?? NAV[0]
}

/** Tells the assistant which page the person is on (DESIGN.md §7). */
function PageContext({ path }: { path: string }) {
  const { setPageChip } = useAssistant()
  const page = pageFor(path)
  useEffect(() => {
    setPageChip({ id: page.id, label: page.label, kind: "page", icon: page.icon })
    return () => setPageChip(null)
  }, [page.id, page.label, page.icon, setPageChip])
  return null
}

function Shell({ path }: { path: string }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icon name="layers" size={14} />
            </span>
            ClientOps
          </Link>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
            {NAV.filter((n) => n.id !== "home").map((n) => (
              <Link
                key={n.id}
                to={n.path}
                aria-current={path === n.path ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  path === n.path && "bg-muted font-medium text-foreground"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
            <kbd className="rounded-sm border px-1">⌘K</kbd> ask or jump
          </span>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-4">
        {path === "/triage" ? <TriageQueue /> : path === "/accounts/renewals" ? <Renewals /> : path === "/ds" ? <DsPage /> : <Home />}
      </main>
    </div>
  )
}

export default function App() {
  const path = usePath()
  return (
    <AssistantProvider
      productName="ClientOps"
      navItems={NAV.map(({ id, label, desc, icon }) => ({ id, label, desc, icon }))}
      onNavigate={(id) => navigate(NAV.find((n) => n.id === id)?.path ?? "/")}
      api={ambientApi}
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50"
      >
        Skip to content
      </a>
      <PageContext path={path} />
      <Shell path={path} />
      <Assistant />
    </AssistantProvider>
  )
}
