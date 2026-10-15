import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import type { RenewalAccount } from "@/data/renewals"
import { evidenceFor, riskLevel, RISK_LABEL } from "./rules"

export function RiskBadge({ account }: { account: RenewalAccount }) {
  const r = riskLevel(account)
  return r === "high" ? (
    <Badge variant="destructive">
      <Icon name="alert" size={12} />
      {RISK_LABEL[r]}
    </Badge>
  ) : (
    <Badge variant={r === "medium" ? "secondary" : "outline"}>{RISK_LABEL[r]}</Badge>
  )
}

const TONE_WORD = { negative: "Raises risk", positive: "Lowers risk", neutral: "No change in risk" } as const

/** Evidence as a list. Tone is carried by text as well as colour. */
export function EvidenceList({ account }: { account: RenewalAccount }) {
  return (
    <ul className="grid gap-2">
      {evidenceFor(account).map((e) => (
        <li key={e.id} className={e.tone === "negative" ? "rounded-md border border-destructive/30 p-3 text-sm" : "rounded-md border p-3 text-sm"}>
          <p className="font-medium">
            {e.label} <span className="text-xs font-normal text-muted-foreground">· {TONE_WORD[e.tone]}</span>
          </p>
          <p className="text-muted-foreground">{e.detail}</p>
        </li>
      ))}
    </ul>
  )
}
