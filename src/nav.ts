import type { IconName } from "@/components/ui/icon"

export const NAV: { id: string; path: string; label: string; desc: string; icon: IconName }[] = [
  { id: "home", path: "/", label: "Overview", desc: "ClientOps and the two triage directions", icon: "home" },
  { id: "triage-a", path: "/triage/a", label: "Triage A: Queue workspace", desc: "Scan the queue, review beside it", icon: "layers" },
  { id: "triage-b", path: "/triage/b", label: "Triage B: Guided review", desc: "One lead at a time, decide, move on", icon: "sparkles" },
  { id: "ds", path: "/ds", label: "Design system", desc: "Foundation, components, governance", icon: "palette" },
]
