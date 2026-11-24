import { useQuery } from "@tanstack/react-query"
import workflowService from "@/services/workflow.service"
import { Loader2, User, ChevronRight, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TaskStatus } from "@/types/enums"

interface WorkflowTimelineProps {
  taskId: string
}

const getStatusStyle = (status: TaskStatus) => {
  const styles: Record<TaskStatus, string> = {
    [TaskStatus.TO_DO]: "bg-slate-100 text-slate-700 border-slate-200",
    [TaskStatus.IN_PROGRESS]: "bg-blue-50 text-blue-700 border-blue-200",
    [TaskStatus.STANDBY]: "bg-amber-50 text-amber-700 border-amber-200",
    [TaskStatus.DONE]: "bg-green-50 text-green-700 border-green-200",
  }
  return styles[status] || "bg-gray-50 text-gray-600"
}

export function WorkflowTimeline({ taskId }: WorkflowTimelineProps) {
  const {
    data: history,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["task-history", taskId],
    queryFn: () => workflowService.getHistoryByTask(taskId),
    enabled: !!taskId,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Loading history...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-lg border border-red-100">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">Failed to load workflow history.</p>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-xl">
        <p className="text-slate-400 text-sm">
          No history recorded for this task yet.
        </p>
      </div>
    )
  }

  return (
    <div className="relative ml-4 mr-2">
      {/* Ligne verticale de la timeline */}
      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-slate-200" />

      <div className="space-y-8">
        {history.map((item, index) => (
          <div key={item._id} className="relative pl-8">
            {/* Point sur la timeline */}
            <div
              className={`absolute left-[-5px] top-1.5 w-[11px] h-[11px] rounded-full border-2 border-white shadow-sm ${
                index === 0 ? "bg-blue-600 ring-4 ring-blue-50" : "bg-slate-400"
              }`}
            />

            {/* Header de l'entrée : Auteur et Date */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <div className="p-1 bg-slate-100 rounded-full">
                  <User className="h-3 w-3 text-slate-600" />
                </div>
                <span>
                  {typeof item.changedBy === "object"
                    ? `${item.changedBy.firstName} ${item.changedBy.lastName}`
                    : "System / User"}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border">
                {new Date(item.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Corps du changement */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 flex-wrap">
                {item.fromStatus ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 opacity-60 font-normal"
                  >
                    {item.fromStatus}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 bg-slate-50 text-slate-400 border-dashed"
                  >
                    Created
                  </Badge>
                )}

                <ChevronRight className="h-3 w-3 text-slate-300" />

                <Badge
                  className={`text-[10px] px-2 py-0 font-bold border ${getStatusStyle(item.toStatus)}`}
                >
                  {item.toStatus}
                </Badge>
              </div>

              {/* Raison / Commentaire */}
              {item.reason && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50/50 p-2 rounded-md border-l-2 border-slate-300 italic">
                  "{item.reason}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
