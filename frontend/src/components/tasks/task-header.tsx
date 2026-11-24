import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Target } from "lucide-react"
import type { UserStory } from "@/types/userStory.types"

interface TaskHeaderProps {
  userStory: UserStory
  onViewDetails: () => void
}

export function TaskHeader({ userStory, onViewDetails }: TaskHeaderProps) {
  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return "bg-red-100 text-red-800 border-red-200"
    if (priority === 2) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <div className="bg-slate-50 p-6 rounded-lg border mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">
              {userStory.title}
            </h1>
          </div>

          {userStory.description && (
            <p className="text-sm text-gray-600 mb-4 max-w-4xl italic">
              "{userStory.description}"
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Priority:</span>
              <Badge
                variant="outline"
                className={getPriorityColor(userStory.priority)}
              >
                Level {userStory.priority}
              </Badge>
            </div>

            <div className="h-4 w-[1px] bg-gray-300 hidden md:block" />

            {userStory.updatedAt && (
              <span className="text-gray-400 text-xs">
                Last updated:{" "}
                {new Date(userStory.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onViewDetails}
          className="shrink-0 border-primary text-primary hover:bg-primary/5"
        >
          <Eye className="mr-2 h-4 w-4" />
          View US Details
        </Button>
      </div>
    </div>
  )
}
