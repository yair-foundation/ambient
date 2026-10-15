import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/lib/router"

export default function Home() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">ClientOps</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Helps an account manager triage incoming leads and decide what to do next.
        </p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Lead triage</CardTitle>
          <CardDescription>Which lead needs me most, and what should I do with it?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p>The queue stays beside the selected lead. Review, resolve what is missing, decide, and undo if you change your mind.</p>
          <div>
            <Button nativeButton={false} render={<Link to="/triage" />}>
              Open lead triage
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Review states: add <code>?state=loading</code>, <code>?state=empty</code> or <code>?state=error</code> to the
        triage URL; <code>?fail=save</code> makes the first save fail.
      </p>
    </div>
  )
}
