import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Clock, Edit, Trash2, Eye, User, History } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import type { Task } from "@/types/task.types"
import { TaskStatus, ValidationStatus } from "@/types/enums"
import { useState } from "react"
import { StatusChangeDialog } from "./status-change-dialog"
import { ValidationDialog } from "./validation-dialog"
import validationService from "@/services/validation.service"
import type { Validation } from "@/types/validation.types"

interface TaskCardProps {
  task: Task
  onView: (task: Task) => void
  onViewWorkflow?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus, reason?: string) => void
  onValidate?: (taskId: string, note?: string) => void
  onReject?: (taskId: string, note?: string) => void
  isStatusUpdating?: boolean
  currentUpdatingId?: string | null
  isStudent?: boolean
  isSupervisor?: boolean
}

const statusStyles: Record<
  TaskStatus,
  { trigger: string; item: string; label: string }
> = {
  [TaskStatus.TO_DO]: {
    trigger: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
    item: "bg-slate-50 text-slate-800 hover:bg-slate-100",
    label: "To Do",
  },
  [TaskStatus.IN_PROGRESS]: {
    trigger: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    item: "bg-blue-50 text-blue-800 hover:bg-blue-100",
    label: "In Progress",
  },
  [TaskStatus.STANDBY]: {
    trigger: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
    item: "bg-amber-50 text-amber-800 hover:bg-amber-100",
    label: "Standby",
  },
  [TaskStatus.DONE]: {
    trigger: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    item: "bg-green-50 text-green-800 hover:bg-green-100",
    label: "Done",
  },
}

export function TaskCard({
  task,
  onView,
  onViewWorkflow,
  onEdit,
  onDelete,
  onStatusChange,
  onValidate,
  onReject,
  isStatusUpdating,
  currentUpdatingId,
  isStudent = false,
  isSupervisor = false,
}: TaskCardProps) {
  const isThisTaskUpdating = isStatusUpdating && currentUpdatingId === task._id
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)
  const [pendingValidationStatus, setPendingValidationStatus] =
    useState<ValidationStatus | null>(null)
  const { data: validations = [] } = useQuery({
    queryKey: ["task-validations", task._id],
    queryFn: () => validationService.getValidationsByTask(task._id),
  })

  const latestValidation = [...validations].sort((a, b) => {
    const left = new Date(a.createdAt ?? 0).getTime()
    const right = new Date(b.createdAt ?? 0).getTime()
    return right - left
  })[0]

  const handleStatusChange = (newStatus: string) => {
    const status = newStatus as TaskStatus
    const oldStatus = task.status

    const isCritical =
      status === TaskStatus.STANDBY ||
      (oldStatus === TaskStatus.DONE && status !== TaskStatus.DONE)

    if (isCritical) {
      setPendingStatus(status)
    } else {
      onStatusChange(task._id, status)
    }
  }

  const SelectedValue = () => (
    <span
      className={
        statusStyles[task.status].trigger +
        " px-2 py-1 rounded-md text-xs font-medium"
      }
    >
      {statusStyles[task.status].label}
    </span>
  )

  const validationBadgeStyles: Record<
    ValidationStatus,
    { label: string; className: string }
  > = {
    [ValidationStatus.VALIDATED]: {
      label: "Validated",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    [ValidationStatus.REJECTED]: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  }

  const pendingValidationState = {
    label: "Not validated yet",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  }

  const renderValidationResult = (validation: Validation) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Latest validation
        </p>
        <Badge
          variant="outline"
          className={validationBadgeStyles[validation.status].className}
        >
          {validationBadgeStyles[validation.status].label}
        </Badge>
      </div>
      {validation.note ? (
        <p className="mt-2 text-sm text-slate-700">{validation.note}</p>
      ) : null}
    </div>
  )

  const renderPendingValidation = () => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Validation status
        </p>
        <Badge variant="outline" className={pendingValidationState.className}>
          {pendingValidationState.label}
        </Badge>
      </div>
    </div>
  )

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden border-slate-200">
      {" "}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 font-medium">
              {task.title}
            </CardTitle>

            <Select
              value={task.status}
              onValueChange={handleStatusChange}
              disabled={isThisTaskUpdating || !isStudent}
            >
              <SelectTrigger className="w-[130px] h-7 border-0 shadow-none p-0 hover:bg-transparent focus:ring-0 disabled:opacity-100">
                <SelectValue>
                  <SelectedValue />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskStatus).map((value) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className={statusStyles[value as TaskStatus].item}
                  >
                    {statusStyles[value as TaskStatus].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1 ml-2">
            {/* BOUTON WORKFLOW */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onViewWorkflow?.(task)}
              title="View Workflow History"
              disabled={isThisTaskUpdating}
            >
              <History className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onView(task)}
              title="View Details"
              disabled={isThisTaskUpdating}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isStudent && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(task)}
                  title="Edit"
                  disabled={isThisTaskUpdating}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete?.(task)}
                  title="Delete"
                  disabled={isThisTaskUpdating}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-2 mt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours || 0}h est.</span>
            </div>
            {task.assignedId && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[100px]">Assigned</span>
              </div>
            )}
          </div>

          {latestValidation
            ? renderValidationResult(latestValidation)
            : task.status === TaskStatus.DONE
              ? renderPendingValidation()
              : null}

          {isSupervisor && task.status === TaskStatus.DONE ? (
            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() =>
                  setPendingValidationStatus(ValidationStatus.VALIDATED)
                }
              >
                Validate
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  setPendingValidationStatus(ValidationStatus.REJECTED)
                }
              >
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
      {pendingValidationStatus ? (
        <ValidationDialog
          open={!!pendingValidationStatus}
          status={pendingValidationStatus}
          onClose={() => setPendingValidationStatus(null)}
          onConfirm={(note) => {
            if (pendingValidationStatus === ValidationStatus.VALIDATED) {
              onValidate?.(task._id, note)
            } else {
              onReject?.(task._id, note)
            }
          }}
        />
      ) : null}
      {pendingStatus && (
        <StatusChangeDialog
          open={!!pendingStatus}
          onClose={() => setPendingStatus(null)}
          oldStatus={task.status}
          newStatus={pendingStatus as TaskStatus}
          onConfirm={(reasonFromDialog) => {
            if (pendingStatus) {
              onStatusChange(task._id, pendingStatus, reasonFromDialog)
            }
            setPendingStatus(null)
          }}
        />
      )}
    </Card>
  )
}
