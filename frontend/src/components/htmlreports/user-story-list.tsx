import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { TaskStatus, ValidationStatus } from "@/types/enums"
import type { UserStoryReport, TaskReport } from "@/types/htmlreport.types"

interface UserStoryListProps {
  userStories: Array<
    UserStoryReport & {
      sprintOrder?: number
    }
  >
  title?: string
  showValidations?: boolean
}

const statusConfig = {
  [TaskStatus.DONE]: {
    bg: "bg-green-50",
    border: "border-green-200",
    color: "text-green-600",
  },
  [TaskStatus.IN_PROGRESS]: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    color: "text-blue-600",
  },
  [TaskStatus.STANDBY]: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    color: "text-orange-600",
  },
  [TaskStatus.TO_DO]: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    color: "text-gray-600",
  },
}

const validationStatusConfig = {
  [ValidationStatus.VALIDATED]: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
    label: "Validated",
  },
  [ValidationStatus.REJECTED]: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
    label: "Rejected",
  },
}

function ValidationBadge({ status }: { status?: ValidationStatus }) {
  if (!status) return null

  const config = validationStatusConfig[status]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge className={`${config.bg} ${config.text} border-none`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

function TaskItem({ task }: { task: TaskReport }) {
  const config = statusConfig[task.status as TaskStatus]
  const latestValidation = task.validations?.[0]

  return (
    <div
      className={`flex items-center justify-between p-3 ${config.bg} rounded-lg border ${config.border}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">{task.title}</p>
          {latestValidation && (
            <ValidationBadge status={latestValidation.status} />
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}
        {task.assignedTo && (
          <p className="text-xs text-muted-foreground mt-1">
            Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}
          </p>
        )}
        {task.validations && task.validations.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {task.validations.length} validation(s)
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        {task.estimatedHours && (
          <span className="text-xs text-muted-foreground">
            {task.estimatedHours}h
          </span>
        )}
        <Badge variant="outline" className={config.bg}>
          {task.status}
        </Badge>
      </div>
    </div>
  )
}

function UserStoryItem({
  userStory,
}: {
  userStory: UserStoryReport & { sprintOrder?: number }
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const stats = useMemo(() => {
    const tasks = userStory.tasks || []
    const totalTasks = tasks.length
    const doneTasks = tasks.filter(
      (t: TaskReport) => t.status === TaskStatus.DONE,
    ).length
    const progress =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      doneTasks,
      progress,
    }
  }, [userStory])

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-semibold">{userStory.title}</h4>
              {userStory.priority && (
                <Badge variant="outline">Priority {userStory.priority}</Badge>
              )}
            </div>

            {userStory.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {userStory.description}
              </p>
            )}

            <div className="grid grid-cols-4 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
              {userStory.sprintOrder !== undefined && (
                <div>
                  <span className="text-muted-foreground">Sprint: </span>
                  <span className="font-medium">
                    Sprint {userStory.sprintOrder}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Tasks: </span>
                <span className="font-medium">{stats.totalTasks}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Progress:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.progress} className="h-2 w-16" />
                    <span className="font-medium text-sm">
                      {stats.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && userStory.tasks && userStory.tasks.length > 0 && (
        <div className="p-4 bg-muted/20 space-y-3 border-t">
          <p className="text-sm font-medium">Tasks:</p>
          {userStory.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

export function UserStoryList({
  userStories,
  title = "User Stories & Tasks",
}: UserStoryListProps) {
  if (!userStories.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userStories.map((userStory) => (
          <UserStoryItem key={userStory.id} userStory={userStory} />
        ))}
      </CardContent>
    </Card>
  )
}
