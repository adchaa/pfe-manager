import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  PieChart,
} from "lucide-react"
import { TaskStatus } from "@/types/enums"

interface StatusDistributionProps {
  byStatus: {
    done: number
    inProgress: number
    standby: number
    todo: number
  }
  totalTasks: number
}

const statusConfig = {
  [TaskStatus.DONE]: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    label: "Done",
  },
  [TaskStatus.IN_PROGRESS]: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "In Progress",
  },
  [TaskStatus.STANDBY]: {
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-50",
    label: "Standby",
  },
  [TaskStatus.TO_DO]: {
    icon: Circle,
    color: "text-gray-400",
    bg: "bg-gray-50",
    label: "To Do",
  },
}

export function StatusDistribution({
  byStatus,
  totalTasks,
}: StatusDistributionProps) {
  const statusItems = [
    {
      status: TaskStatus.DONE,
      count: byStatus.done,
      config: statusConfig[TaskStatus.DONE],
    },
    {
      status: TaskStatus.IN_PROGRESS,
      count: byStatus.inProgress,
      config: statusConfig[TaskStatus.IN_PROGRESS],
    },
    {
      status: TaskStatus.STANDBY,
      count: byStatus.standby,
      config: statusConfig[TaskStatus.STANDBY],
    },
    {
      status: TaskStatus.TO_DO,
      count: byStatus.todo,
      config: statusConfig[TaskStatus.TO_DO],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Task Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusItems.map(({ status, count, config }) => {
            const percentage =
              totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
            const Icon = config.icon

            return (
              <div key={status} className={`p-4 rounded-lg ${config.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <span className="font-medium">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">
                  {percentage}% of total
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
