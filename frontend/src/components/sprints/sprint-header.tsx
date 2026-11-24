import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Handshake } from "lucide-react"
import { format } from "date-fns"
import type { Project } from "@/types/project.types"

interface SprintHeaderProps {
  project: Project
  onViewDetails: () => void
  onManageMeetings: () => void
}

export function SprintHeader({ project, onViewDetails, onManageMeetings }: SprintHeaderProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h1>
          {project.description && (
            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Badge
              variant="outline"
              className={
                project.state === "ACTIVE"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }
            >
              {project.state}
            </Badge>
            <span className="text-gray-500">
              Start: {format(new Date(project.startDate), "dd MMM yyyy")}
            </span>
            <span className="text-gray-500">
              End: {format(new Date(project.endDate), "dd MMM yyyy")}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Project Details
          </Button>
          <Button variant="outline" onClick={onManageMeetings}>
            <Handshake className="mr-2 h-4 w-4" />
            Meetings
          </Button>
        </div>
      </div>
    </div>
  )
}
