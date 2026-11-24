import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Project } from "@/types/project.types"
import { ProjectState } from "@/types/enums"

interface ProjectDetailsDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getProjectStateBadge = (state: ProjectState) => {
  const styles: Record<ProjectState, string> = {
    [ProjectState.ACTIVE]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [ProjectState.ARCHIVED]: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "",
  }

  return (
    <Badge variant="outline" className={styles[state]}>
      {state}
    </Badge>
  )
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
}

export function ProjectDetailsDialog({ project, open, onOpenChange }: ProjectDetailsDialogProps) {
  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{project.title}</h2>
              {getProjectStateBadge(project.state)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-900">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                <p className="mt-1">{format(new Date(project.startDate), "dd MMMM yyyy")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                <p className="mt-1">{format(new Date(project.endDate), "dd MMMM yyyy")}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Supervisors
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        project.academicSupervisor.firstName,
                        project.academicSupervisor.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Academic Supervisor</p>
                    <p className="text-sm text-gray-600">
                      {project.academicSupervisor.firstName}{" "}
                      {project.academicSupervisor.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {project.academicSupervisor.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        project.companySupervisor.firstName,
                        project.companySupervisor.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Company Supervisor</p>
                    <p className="text-sm text-gray-600">
                      {project.companySupervisor.firstName}{" "}
                      {project.companySupervisor.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {project.companySupervisor.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Student
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(project.student.firstName, project.student.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-600">
                    {project.student.firstName} {project.student.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {project.student.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
