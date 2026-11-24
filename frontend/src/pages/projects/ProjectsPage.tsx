import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import ProjectService from "@/services/project.service"
import { useNavigate } from "react-router-dom"
import authService from "@/services/auth.service"
import { UserRole, ProjectState } from "@/types/enums"
import type { Project } from "@/types/project.types"

import { AppLayout } from "@/components/layout/app-layout"
import { StatCard } from "@/components/projects/project-stat-card"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectDetailsDialog } from "@/components/projects/project-details-dialog"
import { ProjectForm } from "@/components/projects/project-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus } from "lucide-react"

import type { TcreateProjectSchema, TupdateProjectSchema } from "@/schemas/project.schema"

export default function ProjectsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = authService.getCurrentUser()
  const isStudent = currentUser?.role === UserRole.ETUDIANT

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [archivingProject, setArchivingProject] = useState<Project | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectService.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setDeletingProject(null)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => ProjectService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setArchivingProject(null)
    },
  })

  const createProject = useMutation({
    mutationFn: async (data: TcreateProjectSchema) => {
      try {
        const [academicRes, companyRes] = await Promise.all([
          ProjectService.getUserByEmail(data.academicSupervisor),
          ProjectService.getUserByEmail(data.companySupervisor),
        ])

        return ProjectService.create({
          title: data.title,
          description: data.description,
          academicSupervisor: academicRes._id,
          companySupervisor: companyRes._id,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        })
      } catch (err: any) {
        setCreateError(err.response?.data?.message || "Error creating project")
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setIsCreateDialogOpen(false)
      setCreateError(null)
    },
  })

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TupdateProjectSchema }) =>
      ProjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setEditingProject(null)
    },
  })

  const handleGenerateGlobalReport = (projectId: string) => {
    navigate(`/html-reports?projectId=${projectId}`)
  }

  const handleManageMeetings = (projectId: string) => {
    navigate(`/meetings?projectId=${projectId}`)
  }
  const handleViewReports = (projectId: string) => {
    navigate(`/reports?projectId=${projectId}`)
  }

  const total = projects?.length ?? 0
  const active = projects?.filter((p) => p.state === ProjectState.ACTIVE).length ?? 0
  const archived = projects?.filter((p) => p.state === ProjectState.ARCHIVED).length ?? 0
  const hasActiveProject = isStudent && projects?.some((p) => p.state === ProjectState.ACTIVE)

  const actionButton =
    isStudent &&
    (hasActiveProject ? (
      <div className="group relative">
        <button
          disabled
          className="flex items-center gap-2 bg-gray-300 text-gray-500 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
        <div className="absolute right-0 mt-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          You already have an active project. You cannot create another one.
        </div>
      </div>
    ) : (
      <button
        onClick={() => setIsCreateDialogOpen(true)}
        className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Project
      </button>
    ))

  if (isLoading) {
    return (
      <AppLayout title="Projects" subtitle="Loading projects...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading projects...</div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Projects" subtitle="Error loading projects">
        <Alert variant="destructive">
          <AlertDescription>Error loading projects</AlertDescription>
        </Alert>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Projects"
      subtitle={`${total} project(s) total`}
      showBackButton
      onBack={() => navigate("/dashboard")}
      action={actionButton}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total" value={total} />
        <StatCard label="Active" value={active} />
        <StatCard label="Archived" value={archived} />
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {projects?.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No projects yet. Create your first project!
          </div>
        )}

        {projects?.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            isStudent={isStudent}
            currentUserId={currentUser?._id || ""}
            onView={setViewingProject}
            onEdit={setEditingProject}
            onArchive={setArchivingProject}
            onDelete={setDeletingProject}
            onGenerateReport={handleGenerateGlobalReport}
            onManageMeetings={handleManageMeetings}
            onViewReports={handleViewReports}
          />
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Fill in the information to create a new project.</DialogDescription>
          </DialogHeader>
          {createError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}
          <ProjectForm
            onSubmit={(data) => createProject.mutate(data as TcreateProjectSchema)}
            onCancel={() => {
              setIsCreateDialogOpen(false)
              setCreateError(null)
            }}
            isPending={createProject.isPending}
            error={createProject.error}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project information.</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              project={editingProject}
              onSubmit={(data) =>
                updateProject.mutate({ id: editingProject._id, data: data as TupdateProjectSchema })
              }
              onCancel={() => setEditingProject(null)}
              isPending={updateProject.isPending}
              error={updateProject.error}
            />
          )}
        </DialogContent>
      </Dialog>

      <ProjectDetailsDialog
        project={viewingProject}
        open={!!viewingProject}
        onOpenChange={(open) => !open && setViewingProject(null)}
      />

      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The project "{deletingProject?.title}" will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingProject && deleteMutation.mutate(deletingProject._id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!archivingProject}
        onOpenChange={(open) => !open && setArchivingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive project?</AlertDialogTitle>
            <AlertDialogDescription>
              The project "{archivingProject?.title}" will be archived. You can still view it but it
              won't be active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archivingProject && archiveMutation.mutate(archivingProject._id)}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
