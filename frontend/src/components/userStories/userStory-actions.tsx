import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface UserStoryActionsProps {
  userStoryCount: number
  isStudent: boolean
  onCreate: () => void
}

export function UserStoryActions({
  userStoryCount,
  isStudent,
  onCreate,
}: UserStoryActionsProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold">User Stories</h2>
        <p className="text-muted-foreground mt-1">
          {userStoryCount} user story(ies) in this sprint
        </p>
      </div>
      {isStudent && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New User Story
        </Button>
      )}
    </div>
  )
}
