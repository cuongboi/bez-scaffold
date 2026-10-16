import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function HomePage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  async function signOut() {
    await authClient.signOut()
    navigate("/sign-in", { replace: true })
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Welcome, {session?.user.name}</h1>
          <p className="text-muted-foreground">{session?.user.email}</p>
          <Button className="mt-2" variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
