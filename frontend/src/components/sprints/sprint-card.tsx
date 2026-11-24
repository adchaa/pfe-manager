import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Edit, Trash2, Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import type { Sprint } from "@/types/sprint.types"
import { SprintStatus } from "@/types/enums"

interface SprintCardProps {
  sprint: Sprint
  onView: (sprint: Sprint) => void
  onEdit: (sprint: Sprint) => void
  onDelete: (sprint: Sprint) => void
  onStatusChange: (sprintId: string, newStatus: string) => void
  onGenerateReport?: (sprintId: string) => void
  isStatusUpdating?: boolean
  currentUpdatingId?: string | null
  isStudent?: boolean
  projectId?: string
}

const statusStyles: Record<SprintStatus, { trigger: string; item: string; label: string }> = {
  [SprintStatus.PLANNED]: {
    trigger: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    item: "bg-blue-50 text-blue-800 hover:bg-blue-100",
    label: "Planned",
  },
  [SprintStatus.IN_PROGRESS]: {
    trigger: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    item: "bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
    label: "In Progress",
  },
  [SprintStatus.COMPLETED]: {
    trigger: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    item: "bg-green-50 text-green-800 hover:bg-green-100",
    label: "Completed",
  },
  [SprintStatus.DONE]: {
    trigger: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    item: "bg-gray-50 text-gray-800 hover:bg-gray-100",
    label: "Done",
  },
}

export function SprintCard({
  sprint,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onGenerateReport,
  isStatusUpdating,
  currentUpdatingId,
  isStudent = true,
  projectId,
}: SprintCardProps) {
  const isThisSprintUpdating = isStatusUpdating && currentUpdatingId === sprint._id

  const SelectedValue = () => (
    <span
      className={statusStyles[sprint.status].trigger + " px-2 py-1 rounded-md text-xs font-medium"}
    >
      {statusStyles[sprint.status].label}
    </span>
  )

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link
              to={`/user-stories?sprintId=${sprint._id}&projectId=${projectId}`}
              className="hover:underline"
            >
              <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                Sprint {sprint.order}: {sprint.title}
              </CardTitle>
            </Link>

            <Select
              value={sprint.status}
              onValueChange={(newStatus) => onStatusChange(sprint._id, newStatus)}
              disabled={isThisSprintUpdating}
            >
              <SelectTrigger className="w-[140px] h-8 border-0 shadow-none p-0 hover:bg-transparent">
                <SelectValue>
                  <SelectedValue />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SprintStatus).map(([key, value]) => (
                  <SelectItem key={value} value={value} className={statusStyles[value].item}>
                    {statusStyles[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(sprint)}
              title="View Details"
              disabled={isThisSprintUpdating}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isStudent && (
              <>
                {onGenerateReport && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onGenerateReport(sprint._id)}
                    title="Generate Report"
                    disabled={isThisSprintUpdating}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sprint)}
                  title="Edit"
                  disabled={isThisSprintUpdating}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(sprint)}
                  title="Delete"
                  disabled={isThisSprintUpdating}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(sprint.startDate), "dd MMMM yyyy")} -{" "}
            {format(new Date(sprint.endDate), "dd MMMM yyyy")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
