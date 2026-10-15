/**
 * THE COMPONENT REGISTRY — the prose that agents and /ds both read.
 *
 * Serializable and React-free on purpose. One entry per vocabulary component
 * (CLAUDE.md rule 10): an undocumented component does not exist as far as an
 * agent composing UI is concerned. `src/ds/catalog.test.ts` fails when a file
 * under src/components/ui or src/features/**\/shared has no entry here.
 *
 * Demos live in ./demos.tsx, joined by `id`.
 */

export type Layer = "product" | "ambient" | "local"

export interface CatalogEntry {
  id: string
  name: string
  layer: Layer
  /** Where the code lives. */
  source: string
  /** What it is for, in one sentence. */
  summary: string
  /** Supported states and behavior, as an agent must know them. */
  behavior: string[]
  whenToUse: string[]
  whenNotToUse: string[]
}

export const GAPS = [
  { missing: "Select", use: "DropdownMenu with radio items, or Tabs for a short set of views" },
  { missing: "Switch", use: "a labeled Checkbox" },
  { missing: "Dialog / modal", use: "Sheet (side panel), or an inline panel" },
  { missing: "Table", use: "a semantic list (<ul>/<li>) or a grid built from Card rows; add Table through the shadcn CLI and document it before use" },
] as const

export const CATALOG: CatalogEntry[] = [
  {
    id: "button",
    name: "Button",
    layer: "product",
    source: "src/components/ui/button.tsx",
    summary: "The one way to trigger an action.",
    behavior: [
      "variants: default (the single primary action), secondary, outline, ghost, destructive, link",
      "sizes: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg",
      "KNOWN ISSUE: variant=destructive has the same red-on-red-tint recipe as Badge (3.85:1 light, 4.36:1 dark, below WCAG AA). Until fixed (docs/proposals/ds-bug-fixes.md), use variant=outline with className border-destructive/40 text-destructive",
      "states: hover, focus-visible ring, active, disabled (pointer-events off), aria-invalid",
      "icon-only buttons must carry an aria-label",
    ],
    whenToUse: ["Any action that changes state or navigates by command", "One default (primary) button per view region"],
    whenNotToUse: ["Navigation between routes (use Link styled as text)", "Toggling a setting (use Checkbox)"],
  },
  {
    id: "badge",
    name: "Badge",
    layer: "product",
    source: "src/components/ui/badge.tsx",
    summary: "A compact label for a status or category.",
    behavior: [
      "variants: default, secondary, outline, destructive, ghost, link",
      "Not interactive unless rendered as a link; never the only carrier of meaning: pair color with text",
      "KNOWN ISSUE: variant=destructive (red text on a red tint) measures 3.85:1 in light and 4.36:1 in dark, below WCAG AA (4.5:1). Until the system fixes it (docs/proposals/ds-bug-fixes.md), use variant=outline with the destructive text role and an icon for blocked or failed status (see ReadinessBadge in src/features/triage/parts.tsx)",
    ],
    whenToUse: ["Status (Ready, Blocked), counts, category tags"],
    whenNotToUse: ["Actions (use Button)", "Long text"],
  },
  {
    id: "card",
    name: "Card",
    layer: "product",
    source: "src/components/ui/card.tsx",
    summary: "A raised surface that groups one unit of content.",
    behavior: ["parts: Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter", "Uses the raised-surface role; its radius follows the Foundation"],
    whenToUse: ["A self-contained unit such as a lead summary or a form group"],
    whenNotToUse: ["Wrapping every section (nesting cards adds noise)", "Page layout (use plain containers)"],
  },
  {
    id: "alert",
    name: "Alert",
    layer: "product",
    source: "src/components/ui/alert.tsx",
    summary: "An inline message about the state of the thing the user is looking at.",
    behavior: [
      "variants: default, destructive",
      "parts: Alert, AlertTitle, AlertDescription, AlertAction",
      "Renders role=alert; use for errors that block progress and for confirmations the user must notice",
      "KNOWN ISSUE: variant=destructive renders the description at text-destructive/90, 4.49:1 on the card ground, just under WCAG AA. Until the system fixes it, use the default variant with an alert icon and a text-destructive title",
    ],
    whenToUse: ["Load failure with a Retry action", "A save that failed", "Confirmation that needs an Undo"],
    whenNotToUse: ["Field-level validation (use aria-invalid on the control plus text)", "Decorative banners"],
  },
  {
    id: "tabs",
    name: "Tabs",
    layer: "product",
    source: "src/components/ui/tabs.tsx",
    summary: "Switch between sibling views of the same subject without leaving the page.",
    behavior: ["parts: Tabs, TabsList, TabsTrigger, TabsContent", "Arrow keys move between triggers; one panel visible at a time"],
    whenToUse: ["Filtering a queue by state", "Two to five peer views"],
    whenNotToUse: ["Sequential steps (use a numbered progress indication)", "More than five options"],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    layer: "product",
    source: "src/components/ui/checkbox.tsx",
    summary: "A boolean choice; also the documented substitute for a Switch.",
    behavior: ["states: unchecked, checked, indeterminate, disabled, aria-invalid", "Always pair with a visible label"],
    whenToUse: ["Confirmations, settings, multi-select"],
    whenNotToUse: ["Choosing one of many (use Tabs or a DropdownMenu radio group)"],
  },
  {
    id: "input",
    name: "Input",
    layer: "product",
    source: "src/components/ui/input.tsx",
    summary: "Single-line text, number or date entry.",
    behavior: ["states: focus ring, disabled, aria-invalid", "Always labelled; error text sits under the field and is referenced by aria-describedby"],
    whenToUse: ["Short values: names, numbers, dates"],
    whenNotToUse: ["Multi-line notes (use Textarea)", "A fixed set of choices"],
  },
  {
    id: "textarea",
    name: "Textarea",
    layer: "product",
    source: "src/components/ui/textarea.tsx",
    summary: "Multi-line text entry. Added through the shadcn CLI when ClientOps needed notes.",
    behavior: ["states: focus ring, disabled, aria-invalid", "Always labelled"],
    whenToUse: ["Free-text notes and reasons"],
    whenNotToUse: ["Short values (use Input)"],
  },
  {
    id: "dropdown-menu",
    name: "DropdownMenu",
    layer: "product",
    source: "src/components/ui/dropdown-menu.tsx",
    summary: "A menu of actions or a choice among options, opened from a trigger. The documented substitute for Select.",
    behavior: ["Keyboard: Enter or arrows open, arrows move, Escape closes and returns focus to the trigger", "Items may be plain, checkbox or radio items"],
    whenToUse: ["Secondary actions", "Choosing one value from a short list"],
    whenNotToUse: ["The primary action of a view", "Navigation"],
  },
  {
    id: "sheet",
    name: "Sheet",
    layer: "product",
    source: "src/components/ui/sheet.tsx",
    summary: "A panel that slides over the page from an edge. The documented substitute for Dialog.",
    behavior: ["Traps focus, closes on Escape and overlay click, restores focus to the trigger", "Sides: top, right, bottom, left"],
    whenToUse: ["Detail or a form that should not lose the list behind it on small screens"],
    whenNotToUse: ["Short confirmations (use Alert)", "Content the user needs beside the list on desktop (use a pane)"],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    layer: "product",
    source: "src/components/ui/skeleton.tsx",
    summary: "A placeholder with the shape of content that is loading.",
    behavior: ["Pulses; decorative, so hide from assistive tech and announce loading separately with aria-busy or a status text"],
    whenToUse: ["Initial load of lists and detail panes"],
    whenNotToUse: ["Actions in flight (disable the control and show progress text)"],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    layer: "product",
    source: "src/components/ui/tooltip.tsx",
    summary: "A short label for an icon-only control or a truncated value.",
    behavior: ["Opens on hover and focus; needs TooltipProvider at the app root (already mounted)"],
    whenToUse: ["Explaining an icon"],
    whenNotToUse: ["Information the user needs to complete a task", "Touch-only flows"],
  },
  {
    id: "separator",
    name: "Separator",
    layer: "product",
    source: "src/components/ui/separator.tsx",
    summary: "A hairline between groups.",
    behavior: ["orientation: horizontal or vertical; uses the hairline-border role"],
    whenToUse: ["Dividing groups inside one surface"],
    whenNotToUse: ["Spacing (use gap utilities)"],
  },
  {
    id: "sidebar",
    name: "Sidebar",
    layer: "product",
    source: "src/components/ui/sidebar.tsx",
    summary: "The navigation rail (installed with the ambient layer; ClientOps does not use it yet).",
    behavior: ["Collapsible; becomes a Sheet on small screens"],
    whenToUse: ["Persistent app navigation once ClientOps has more than a handful of routes"],
    whenNotToUse: ["The current four-route header navigation"],
  },
  {
    id: "icon",
    name: "Icon",
    layer: "product",
    source: "src/components/ui/icon.tsx",
    summary: "Semantic icons drawn by the Foundation's configured library.",
    behavior: ["<Icon name=\"check\" /> with names from the closed IconName set (see src/lib/icon-library.ts)", "Decorative by default: put the label on the parent control", "No direct icon-library imports; a new name must be mapped in all five libraries"],
    whenToUse: ["Every icon in product UI"],
    whenNotToUse: ["Carrying meaning without text"],
  },
  {
    id: "assistant",
    name: "Assistant (ambient layer)",
    layer: "ambient",
    source: "src/components/ambient/",
    summary: "The assistant above the product: orb, panel, dock and spotlight (Cmd-K). Answers come from src/lib/ambient/stubs until a backend exists.",
    behavior: [
      "Each page announces itself with setPageChip (see PageContext in App.tsx)",
      "Five modes (line, panel, dock, spotlight, history); do not add modes",
      "The full ambient vocabulary is listed in .claude/skills/ambientui-start/DESIGN.md section 6",
    ],
    whenToUse: ["Asking about the data on the current page", "Jumping between pages"],
    whenNotToUse: ["Primary workflows; the assistant explains, the product acts"],
  },
]
