import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFoundation } from "@/components/foundation-provider"
import {
  ACCENTS,
  GRAYS,
  ICON_LIBRARIES,
  MOTION_CHARACTERS,
  MOTION_PACES,
  RADIUS_SCALE,
  SCALINGS,
  SPACING_GRIDS,
  type FoundationConfig,
} from "@/lib/foundation/tokens"
import { cn } from "@/lib/utils"
import { setAppearance, useAppearance } from "@/lib/appearance"

import { CATALOG, GAPS } from "./catalog"
import { DEMOS } from "./demos"

function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { id: T; name: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <Button
            key={String(o.id)}
            size="xs"
            variant={o.id === value ? "default" : "outline"}
            aria-pressed={o.id === value}
            onClick={() => onChange(o.id)}
          >
            {o.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

function Foundation() {
  const { config, setConfig, save, discard, reset, dirty } = useFoundation()
  const appearance = useAppearance()
  const set = (patch: Partial<FoundationConfig>) => setConfig(patch)
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={!dirty}>Save theme</Button>
          <Button variant="outline" onClick={discard} disabled={!dirty}>Discard edits</Button>
          <Button variant="ghost" onClick={reset}>Reset to defaults</Button>
          <span role="status" className="text-xs text-muted-foreground">
            {dirty ? "Unsaved changes. Edits apply live; only Save keeps them." : "Saved."}
          </span>
        </div>
        <Choice label="Appearance" value={appearance} options={[{ id: "light", name: "Light" }, { id: "dark", name: "Dark" }]} onChange={setAppearance} />
        <Choice label="Accent (marks actions only)" value={config.accent} options={ACCENTS.map((a) => ({ id: a.id, name: a.name }))} onChange={(accent) => set({ accent })} />
        <Choice label="Gray family (every surface and border)" value={config.gray} options={GRAYS.map((g) => ({ id: g.id, name: g.name }))} onChange={(gray) => set({ gray })} />
        <Choice label="Corner radius" value={config.radius} options={RADIUS_SCALE.map((r) => ({ id: r.px, name: `${r.name} ${r.px}px` }))} onChange={(radius) => set({ radius })} />
        <Choice label="Spacing unit" value={config.spacingGrid} options={SPACING_GRIDS.map((g) => ({ id: g.id, name: `${g.name} ${g.unit}px` }))} onChange={(spacingGrid) => set({ spacingGrid })} />
        <Choice label="Type scaling (density)" value={config.scaling} options={SCALINGS.map((s) => ({ id: s.pct, name: `${s.pct}%` }))} onChange={(scaling) => set({ scaling })} />
        <Choice label="Motion character" value={config.motion.character} options={MOTION_CHARACTERS.map((m) => ({ id: m.id, name: m.name }))} onChange={(character) => set({ motion: { ...config.motion, character } })} />
        <Choice label="Motion pace" value={config.motion.pace} options={MOTION_PACES.map((m) => ({ id: m.pct, name: m.name }))} onChange={(pace) => set({ motion: { ...config.motion, pace } })} />
        <Choice label="Icon library" value={config.icons} options={ICON_LIBRARIES.map((i) => ({ id: i.id, name: i.name }))} onChange={(icons) => set({ icons })} />
        <p className="max-w-prose text-sm text-muted-foreground">
          ClientOps defaults: a slate ground with an indigo accent used only for actions, slightly tight corners
          (6px) and compact type (95%) for a calm, dense working tool. These are Foundation values, not styling:
          change one here and every screen follows.
        </p>
      </div>
      <Card aria-label="Propagation sample">
        <CardHeader>
          <CardTitle>Propagation sample</CardTitle>
          <CardDescription>Every control on the left must visibly change this card.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Company
            <Input defaultValue="Northwind Freight" />
          </label>
          <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Contact confirmed</label>
          <div className="flex flex-wrap gap-2">
            <Badge>Ready</Badge>
            <Badge variant="secondary">Needs info</Badge>
            <Badge variant="destructive">Blocked</Badge>
          </div>
          <div className="flex gap-2">
            <Button>Qualify</Button>
            <Button variant="outline">Nurture</Button>
          </div>
          <Alert>
            <Icon name="check" />
            <AlertTitle>Qualified</AlertTitle>
            <AlertDescription>Assigned to you.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

function Components() {
  return (
    <div className="grid gap-4">
      <Alert>
        <AlertTitle>Known gaps</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-4">
            {GAPS.map((g) => (
              <li key={g.missing}>
                No {g.missing}: use {g.use}.
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
      <div className="grid gap-3">
        {CATALOG.map((c) => (
          <Card key={c.id} id={`c-${c.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {c.name}
                <Badge variant="outline">{c.layer}</Badge>
              </CardTitle>
              <CardDescription>{c.summary}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md border bg-muted/40 p-3">{DEMOS[c.id]?.()}</div>
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <ListBlock title="Behavior and states" items={c.behavior} />
                <ListBlock title="Use when" items={c.whenToUse} />
                <ListBlock title="Do not use when" items={c.whenNotToUse} />
              </div>
              <code className="text-xs text-muted-foreground">{c.source}</code>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-medium text-muted-foreground">{title}</h4>
      <ul className="list-disc space-y-1 pl-4">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

const ROLES = [
  { name: "Design System Manager", skill: ".claude/skills/ds-manager/SKILL.md", job: "Checks changes against tokens, components and layout rules; decides promote or reject; keeps the registry in sync." },
  { name: "Product Design Manager", skill: ".claude/skills/product-design-manager/SKILL.md", job: "Guards the right surface for each use case, flow consistency and UX quality." },
  { name: "Product Copy", skill: ".claude/skills/product-copy/SKILL.md", job: "Guards microcopy, errors, empty states, terminology and voice." },
]

function Governance() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {ROLES.map((r) => (
          <Card key={r.name}>
            <CardHeader>
              <CardTitle>{r.name}</CardTitle>
              <CardDescription>{r.job}</CardDescription>
            </CardHeader>
            <CardContent>
              <code className="text-xs text-muted-foreground">{r.skill}</code>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>How a shared change happens</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>Agents select from the system and do not invent outside it. Where to look, in order:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li><code>CLAUDE.md</code> (repo root) points to the rules and this registry.</li>
            <li><code>src/ds/catalog.ts</code>: every component, its states, when to use it and when not to.</li>
            <li><code>docs/decisions/</code>: approved design decisions and the reasoning behind them.</li>
            <li><code>.claude/skills/ambientui-start/DESIGN.md</code>: the token and propagation rules.</li>
          </ol>
          <p>
            A new pattern is never merged silently. The pattern watchlist protocol applies: stop, ask a person whether
            it should become part of the system, and only on yes implement it, document it here and log the decision.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DsPage() {
  const [tab, setTab] = React.useState<string>(() => (window.location.hash.slice(1) || "foundation"))
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Design system</h1>
        <p className="text-sm text-muted-foreground">
          One configuration drives every component. Three layers: Data (Foundation), Component (registry), Agent
          (governance).
        </p>
      </div>
      <Tabs value={tab} onValueChange={(v) => { setTab(String(v)); window.history.replaceState(null, "", `#${v}`) }}>
        <TabsList>
          <TabsTrigger value="foundation">Foundation</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="foundation" className={cn("pt-4")}><Foundation /></TabsContent>
        <TabsContent value="components" className="pt-4"><Components /></TabsContent>
        <TabsContent value="governance" className="pt-4"><Governance /></TabsContent>
      </Tabs>
    </div>
  )
}
