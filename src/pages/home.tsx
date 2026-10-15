import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/lib/router"

const DIRECTIONS = [
  {
    to: "/triage/a",
    title: "A. Queue workspace",
    decision: "Which lead needs me most, and what is the state of everything?",
    how: "The whole queue stays on screen beside the selected lead. Scan, filter, jump, decide.",
  },
  {
    to: "/triage/b",
    title: "B. Guided review",
    decision: "What should I do with this lead, right now?",
    how: "One lead at a time with a recommended next action. Resolve gaps, decide, move on.",
  },
]

export default function Home() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">ClientOps</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Mission: help an account manager triage incoming leads and decide what to do next. Two working directions
          share the same data, rules and design system. Review both, then choose.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {DIRECTIONS.map((d) => (
          <Card key={d.to}>
            <CardHeader>
              <CardTitle>{d.title}</CardTitle>
              <CardDescription>{d.decision}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p>{d.how}</p>
              <div>
                <Button nativeButton={false} render={<Link to={d.to} />}>Open {d.title.split(".")[0]}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Review states: add <code>?state=loading</code>, <code>?state=empty</code> or <code>?state=error</code> to a
        direction's URL; <code>?fail=save</code> makes the first save fail.
      </p>
    </div>
  )
}
