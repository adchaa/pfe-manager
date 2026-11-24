import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import type { Sprint } from "@/types/sprint.types"

interface SprintHeaderProps {
  sprint: Sprint
  onViewDetails: () => void
}

export function SprintHeader({ sprint, onViewDetails }: SprintHeaderProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {sprint.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Badge
              variant="outline"
              className={
                sprint.status === "PLANNED"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }
            >
              {sprint.status}
            </Badge>
            <span className="text-gray-500">
              Start: {format(new Date(sprint.startDate), "dd MMM yyyy")}
            </span>
            <span className="text-gray-500">
              End: {format(new Date(sprint.endDate), "dd MMM yyyy")}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={onViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          View Sprint Details
        </Button>
      </div>
    </div>
  )
}
