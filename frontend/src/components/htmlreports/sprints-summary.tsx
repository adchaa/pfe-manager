import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Layers } from "lucide-react"
import { format } from "date-fns"
import type { SprintSummary } from "@/types/htmlreport.types"

interface SprintsSummaryProps {
  sprints: SprintSummary[]
}

const statusColors = {
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  PLANNED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

export function SprintsSummary({ sprints }: SprintsSummaryProps) {
  if (!sprints.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Sprints Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">
                    Sprint {sprint.order}: {sprint.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(sprint.startDate), "dd MMM")} -{" "}
                    {format(new Date(sprint.endDate), "dd MMM yyyy")}
                  </div>
                </div>
                <Badge
                  className={
                    statusColors[sprint.status as keyof typeof statusColors]
                  }
                >
                  {sprint.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tasks</p>
                  <p className="font-medium">{sprint.statistics.totalTasks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium text-green-600">
                    {sprint.statistics.doneTasks}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Validated</p>
                  <p className="font-medium text-blue-600">
                    {sprint.statistics.validatedTasks}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stories</p>
                  <p className="font-medium">
                    {sprint.statistics.userStoriesCount}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">
                    {sprint.statistics.progress}%
                  </span>
                </div>
                <Progress value={sprint.statistics.progress} className="h-2" />

                <div className="flex justify-between text-sm mt-2">
                  <span>Validation Progress</span>
                  <span className="font-medium">
                    {sprint.statistics.validationProgress}%
                  </span>
                </div>
                <Progress
                  value={sprint.statistics.validationProgress}
                  className="h-2 bg-blue-100"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
