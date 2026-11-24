import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface TaskActionsProps {
  taskCount: number
  onCreate: () => void
}

export function TaskActions({ taskCount, onCreate }: TaskActionsProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <p className="text-muted-foreground mt-1">
          {taskCount} task(s) in this user story
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        New Task
      </Button>
    </div>
  )
}
