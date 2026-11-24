import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare, Plus } from "lucide-react"

interface TaskEmptyStateProps {
  onCreate: () => void
}

export function TaskEmptyState({ onCreate }: TaskEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4 text-center">
          No tasks in this user story yet.
          <br />
          Start by breaking down your requirements into actionable tasks.
        </p>
        <Button variant="outline" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create first task
        </Button>
      </CardContent>
    </Card>
  )
}
