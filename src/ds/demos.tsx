import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { UndoNoticeDemo } from "./undo-notice-demo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


/** Live examples, keyed by catalog id. */
export const DEMOS: Record<string, () => React.ReactNode> = {
  button: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Qualify</Button>
      <Button variant="secondary">Request info</Button>
      <Button variant="outline">Nurture</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="destructive">Disqualify</Button>
      <Button disabled>Disabled</Button>
      <Button size="icon" variant="outline" aria-label="Copy"><Icon name="copy" /></Button>
    </div>
  ),
  badge: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Ready</Badge>
      <Badge variant="secondary">Needs info</Badge>
      <Badge variant="destructive">Blocked</Badge>
      <Badge variant="outline">Webinar</Badge>
    </div>
  ),
  card: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Northwind Freight</CardTitle>
        <CardDescription>Demo request, 1h ago</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">45 dispatchers across three depots.</CardContent>
    </Card>
  ),
  alert: () => (
    <div className="grid max-w-md gap-2">
      <Alert>
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Decision recorded.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Couldn't load leads</AlertTitle>
        <AlertDescription>Check your connection and try again.</AlertDescription>
      </Alert>
    </div>
  ),
  tabs: () => (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="ready">Ready</TabsTrigger>
        <TabsTrigger value="blocked">Blocked</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
  checkbox: () => (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox defaultChecked /> Contact confirmed
    </label>
  ),
  input: () => (
    <label className="grid max-w-xs gap-1 text-sm">
      Team size
      <Input type="number" placeholder="e.g. 45" />
    </label>
  ),
  textarea: () => (
    <label className="grid max-w-sm gap-1 text-sm">
      Note
      <Textarea placeholder="Why this decision?" />
    </label>
  ),
  "dropdown-menu": () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Snooze</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>1 week</DropdownMenuItem>
        <DropdownMenuItem>1 month</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  sheet: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Lead detail</SheetTitle>
          <SheetDescription>Opens over the list on small screens.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  skeleton: () => (
    <div className="grid max-w-xs gap-2" aria-hidden>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-56" />
    </div>
  ),
  tooltip: () => (
    <Tooltip>
      <TooltipTrigger render={<Button size="icon" variant="outline" aria-label="Edit" />}>
        <Icon name="edit" />
      </TooltipTrigger>
      <TooltipContent>Edit lead</TooltipContent>
    </Tooltip>
  ),
  separator: () => (
    <div className="max-w-xs text-sm">
      Above
      <Separator className="my-2" />
      Below
    </div>
  ),
  sidebar: () => <p className="text-sm text-muted-foreground">Not used by ClientOps yet.</p>,
  icon: () => (
    <div className="flex gap-3">
      {(["check", "alert", "calendar", "user", "search"] as const).map((n) => (
        <Icon key={n} name={n} />
      ))}
    </div>
  ),
  "undo-notice": () => <UndoNoticeDemo />,
  assistant: () => <p className="text-sm text-muted-foreground">Press ⌘K (Ctrl+K) to open it.</p>,
}
