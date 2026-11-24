import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Edit, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import type { UserStory } from "@/types/userStory.types"

interface UserStoryCardProps {
  userStory: UserStory
  isStudent: boolean
  onView: (userStory: UserStory) => void
  onEdit: (userStory: UserStory) => void
  onDelete: (userStory: UserStory) => void
  currentUpdatingId?: string | null
}

export function UserStoryCard({
  userStory,
  isStudent,
  onView,
  onEdit,
  onDelete,
  currentUpdatingId,
}: UserStoryCardProps) {
  const navigate = useNavigate()

  const isThisUpdating = currentUpdatingId === userStory._id

  // Navigation vers tasks
  const handleTitleClick = () => {
    navigate(`/tasks?userStoryId=${userStory._id}`)
  }

  // 🎨 Couleurs par priorité
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-700 border-red-300"
      case 2:
        return "bg-orange-100 text-orange-700 border-orange-300"
      case 3:
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case 4:
        return "bg-green-100 text-green-700 border-green-300"
      case 5:
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-gray-100 text-gray-600 border-gray-300"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">

            {/* TITLE */}
            <CardTitle
              className="text-xl mb-2 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
              onClick={handleTitleClick}
              title="Click to view tasks"
            >
              User Story : {userStory.title}
            </CardTitle>

            {/* DESCRIPTION */}
            {userStory.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {userStory.description}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(userStory)}
              disabled={isThisUpdating}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isStudent && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(userStory)}
                  disabled={isThisUpdating}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(userStory)}
                  disabled={isThisUpdating}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm">

          {/* PRIORITY BADGE 🎨 */}
          <span
            className={`px-3 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(
              userStory.priority
            )}`}
          >
            Priority {userStory.priority}
          </span>

          {/* DATE */}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {userStory.createdAt
                ? format(new Date(userStory.createdAt), "PPP")
                : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}