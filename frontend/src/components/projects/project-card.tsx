import { Link } from "react-router-dom"
import { Calendar, Eye, Edit, Archive, Trash2, FileText, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BadgeState } from "./project-badge-state"
import type { Project } from "@/types/project.types"
import { ProjectState } from "@/types/enums"

interface ProjectCardProps {
  project: Project
  isStudent: boolean
  currentUserId: string
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onArchive: (project: Project) => void
  onDelete: (project: Project) => void
  onGenerateReport?: (projectId: string) => void
  onManageMeetings?: (projectId: string) => void
  onViewReports: (projectId: string) => void
}

export function ProjectCard({
  project,
  isStudent,
  currentUserId,
  onView,
  onEdit,
  onArchive,
  onDelete,
  onGenerateReport,
  onManageMeetings,
  onViewReports,
}: ProjectCardProps) {
  const isOwner = isStudent && project.student._id === currentUserId

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <Link
              to={`/sprints?projectId=${project._id}`}
              className="text-lg font-bold text-gray-900 hover:underline"
            >
              {project.title}
            </Link>
            <BadgeState state={project.state} />
          </div>

          {project.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
          )}

          <div className="flex items-center gap-1 text-sm text-gray-400 mt-2">
            <Calendar className="w-4 h-4" />
            {new Date(project.startDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" - "}
            {new Date(project.endDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="icon" onClick={() => onView(project)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>

          {/* HTML Report Button - Global Project Report */}
          {isStudent && onGenerateReport && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onGenerateReport(project._id)}
              title="Generate Global Project Report"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}

          {onManageMeetings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManageMeetings(project._id)}
              title="Manage Meetings"
              className="text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
            >
              <Handshake className="h-4 w-4" />
            </Button>
          )}

          {isOwner && (
            <>
              <Button variant="ghost" size="icon" onClick={() => onEdit(project)} title="Edit">
                <Edit className="h-4 w-4" />
              </Button>

              {project.state === ProjectState.ACTIVE && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onArchive(project)}
                  title="Archive"
                >
                  <Archive className="h-4 w-4 text-yellow-600" />
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => onDelete(project)} title="Delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>

              
            </>
          )}
          <Button
                onClick={() => onViewReports(project._id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Reports"
              >
                <FileText className="w-4 h-4" />
              </Button>
        </div>
      </div>
    </div>
  )
}