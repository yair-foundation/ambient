import type { IconName } from "@/components/ui/icon"

export const NAV: { id: string; path: string; label: string; desc: string; icon: IconName }[] = [
  { id: "home", path: "/", label: "Overview", desc: "ClientOps overview", icon: "home" },
  { id: "triage", path: "/triage", label: "Lead triage", desc: "Review incoming leads and decide what to do next", icon: "layers" },
  { id: "ds", path: "/ds", label: "Design system", desc: "Foundation, components, governance", icon: "palette" },
]
