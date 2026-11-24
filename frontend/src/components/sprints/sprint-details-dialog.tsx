import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, X } from "lucide-react"
import { format } from "date-fns"
import type { Sprint } from "@/types/sprint.types"
import { SprintStatus } from "@/types/enums"

interface SprintDetailsDialogProps {
  sprint: Sprint | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusBadge = (status: SprintStatus) => {
  const variants: Record<SprintStatus, string> = {
    [SprintStatus.PLANNED]: "bg-blue-100 text-blue-800 border-blue-200",
    [SprintStatus.IN_PROGRESS]:
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    [SprintStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
    [SprintStatus.DONE]: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const labels: Record<SprintStatus, string> = {
    [SprintStatus.PLANNED]: "Planned",
    [SprintStatus.IN_PROGRESS]: "In Progress",
    [SprintStatus.COMPLETED]: "Completed",
    [SprintStatus.DONE]: "Done",
  }

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

export function SprintDetailsDialog({
  sprint,
  open,
  onOpenChange,
}: SprintDetailsDialogProps) {
  if (!sprint) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sprint Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                Sprint {sprint.order}: {sprint.title}
              </h2>
              <div className="mt-2">{getStatusBadge(sprint.status)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Start Date
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {format(new Date(sprint.startDate), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {format(new Date(sprint.endDate), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Order</h3>
              <p className="mt-1 text-gray-900">Sprint #{sprint.order}</p>
            </div>

            {sprint.goal && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                <p className="mt-1 text-gray-900">{sprint.goal}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
