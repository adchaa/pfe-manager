import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
interface SprintActionsProps {
  sprintCount: number
  onCreate: () => void
}

export function SprintActions({ sprintCount, onCreate }: SprintActionsProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold">Sprints</h2>
        <p className="text-muted-foreground mt-1">
          {sprintCount} sprint(s) in this project
        </p>
      </div>

      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        New Sprint
      </Button>
    </div>
  )
}
