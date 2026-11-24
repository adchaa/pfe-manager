import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, RefreshCw, User } from "lucide-react"
import { format } from "date-fns"
import { TaskStatus } from "@/types/enums"

interface TaskHistoryItem {
  taskId: string
  fromStatus: TaskStatus
  toStatus: TaskStatus
  changedBy?: {
    firstName: string
    lastName: string
  } | null
  reason?: string
  date: string
}

interface TaskHistoryProps {
  history: TaskHistoryItem[]
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TO_DO]: "bg-gray-100 text-gray-700",
  [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700",
  [TaskStatus.DONE]: "bg-green-100 text-green-700",
  [TaskStatus.STANDBY]: "bg-orange-100 text-orange-700",
}

export function TaskHistory({ history }: TaskHistoryProps) {
  if (!history.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Task History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={statusColors[item.fromStatus]}>
                    {item.fromStatus}
                  </Badge>
                  <span>→</span>
                  <Badge className={statusColors[item.toStatus]}>
                    {item.toStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(new Date(item.date), "dd MMM yyyy HH:mm")}
                  </span>
                </div>
                {item.changedBy && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    by {item.changedBy.firstName} {item.changedBy.lastName}
                  </p>
                )}
                {item.reason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reason: {item.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
