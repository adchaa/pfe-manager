import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, User, AlignLeft, Target, Calendar, History } from "lucide-react"
import type { Task } from "@/types/task.types"
import { TaskStatus } from "@/types/enums"
import { useEffect, useState } from "react"
import { WorkflowTimeline } from "./workflow-timeline"

interface TaskDetailsDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialViewWorkflow?: boolean
  supervisorName?: string
}

const getStatusBadge = (status: TaskStatus) => {
  const variants: Record<TaskStatus, string> = {
    [TaskStatus.TO_DO]: "bg-slate-100 text-slate-800 border-slate-200",
    [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 border-blue-200",
    [TaskStatus.STANDBY]: "bg-amber-100 text-amber-800 border-amber-200",
    [TaskStatus.DONE]: "bg-green-100 text-green-800 border-green-200",
  }

  const labels: Record<TaskStatus, string> = {
    [TaskStatus.TO_DO]: "To Do",
    [TaskStatus.IN_PROGRESS]: "In Progress",
    [TaskStatus.STANDBY]: "Standby",
    [TaskStatus.DONE]: "Done",
  }

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  initialViewWorkflow = false,
  supervisorName,
}: TaskDetailsDialogProps) {
  const [viewWorkflow, setViewWorkflow] = useState(initialViewWorkflow)

  useEffect(() => {
    if (open) {
      setViewWorkflow(initialViewWorkflow)
    }
  }, [open, initialViewWorkflow])

  if (!task) return null

  const displaySupervisor = () => {
    if (supervisorName) return supervisorName
    if (typeof task.assignedId === "object" && task.assignedId !== null) {
      const u = task.assignedId as any
      return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email
    }
    return task.assignedId || "Not assigned"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {viewWorkflow ? (
              <>
                <History className="h-5 w-5 text-blue-600" />
                Task Workflow History
              </>
            ) : (
              <>
                <Target className="h-5 w-5 text-primary" />
                Task Details
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {viewWorkflow
              ? "Track status changes and updates for this task."
              : "Technical specifications and assignment for this task."}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          {viewWorkflow ? (
            /* --- VUE WORKFLOW (HISTORIQUE) --- */
            <div className="space-y-6">
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <WorkflowTimeline taskId={task._id} />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewWorkflow(false)}
                ></Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            /* --- VUE DÉTAILS (VOTRE CODE ACTUEL) --- */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {task.title}
                </h2>
                {getStatusBadge(task.status)}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Estimation
                  </h3>
                  <p className="text-gray-900 font-medium ml-6">
                    {task.estimatedHours || 0} hours
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" /> Supervisor
                  </h3>
                  <p className="text-gray-900 font-medium ml-6">
                    {displaySupervisor()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" /> Description
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {task.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="font-semibold uppercase text-[10px]">
                      Created At
                    </p>
                    <p>
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Clock className="h-4 w-4" />
                  <div>
                    <p className="font-semibold uppercase text-[10px]">
                      Last Update
                    </p>
                    <p>
                      {task.updatedAt
                        ? new Date(task.updatedAt).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-100 hover:bg-blue-50"
                  onClick={() => setViewWorkflow(true)}
                >
                  <History className="mr-2 h-4 w-4" /> View History
                </Button>
                <Button onClick={() => onOpenChange(false)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
