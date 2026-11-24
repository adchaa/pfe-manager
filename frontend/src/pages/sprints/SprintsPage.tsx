import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { AppLayout } from "@/components/layout/app-layout"
import sprintService from "@/services/sprint.service"
import projectService from "@/services/project.service"
import authService from "@/services/auth.service"
import { SprintForm } from "@/components/sprints/sprint-form"
import { SprintCard } from "@/components/sprints/sprint-card"
import { SprintHeader } from "@/components/sprints/sprint-header"
import { SprintEmptyState } from "@/components/sprints/sprint-empty-state"
import { SprintActions } from "@/components/sprints/sprint-actions"
import { SprintDetailsDialog } from "@/components/sprints/sprint-details-dialog"
import { ProjectDetailsDialog } from "@/components/projects/project-details-dialog"
import { extractErrorMessage } from "@/lib/error"
import { SprintStatus, UserRole } from "@/types/enums"
import type { Sprint } from "@/types/sprint.types"
import type { Project } from "@/types/project.types"

export default function SprintsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectIdFromUrl = searchParams.get("projectId")
  const currentUser = authService.getCurrentUser()

  const isStudent = currentUser?.role === UserRole.ETUDIANT

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null)
  const [viewingSprint, setViewingSprint] = useState<Sprint | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectIdFromUrl || "my-project"],
    queryFn: () =>
      projectIdFromUrl ? projectService.getById(projectIdFromUrl) : projectService.getMyProject(),
  })

  const {
    data: sprints,
    isLoading: isLoadingSprints,
    error: sprintsError,
  } = useQuery({
    queryKey: ["sprints", project?._id],
    queryFn: () => sprintService.getSprintsByProject(project!._id),
    enabled: !!project?._id,
  })

  const createSprint = useMutation({
    mutationFn: sprintService.createSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", project?._id] })
      setIsCreateDialogOpen(false)
      setCreateError(null)
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.message || "Error creating sprint")
    },
  })

  const updateSprint = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sprintService.updateSprint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", project?._id] })
      setEditingSprint(null)
    },
  })

  const deleteSprint = useMutation({
    mutationFn: sprintService.deleteSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", project?._id] })
      setDeletingSprint(null)
    },
  })

  const updateSprintStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sprintService.updateSprint(id, { status: status as SprintStatus }),
    onMutate: ({ id }) => {
      setUpdatingStatusId(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", project?._id] })
    },
    onSettled: () => {
      setUpdatingStatusId(null)
    },
  })

  const handleGenerateSprintReport = (sprintId: string) => {
    navigate(`/html-reports?projectId=${project?._id}&sprintId=${sprintId}`)
  }

  const handleManageMeetings = () => {
    navigate(`/meetings?projectId=${project?._id}`)
  }

  const actionButton = isStudent && (
    <button
      onClick={() => setIsCreateDialogOpen(true)}
      className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      New Sprint
    </button>
  )

  if (isLoadingProject) {
    return (
      <AppLayout title="Sprints" subtitle="Loading project...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading project...</span>
        </div>
      </AppLayout>
    )
  }

  if (projectError || !project) {
    const errorMessage = extractErrorMessage(projectError)
    return (
      <AppLayout title="Sprints" subtitle="Error loading project">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error: {errorMessage}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </AppLayout>
    )
  }

  if (isLoadingSprints) {
    return (
      <AppLayout title="Sprints" subtitle={project.title}>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-6 w-64 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </AppLayout>
    )
  }

  if (sprintsError) {
    return (
      <AppLayout title="Sprints" subtitle={project.title}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading sprints: {extractErrorMessage(sprintsError)}
          </AlertDescription>
        </Alert>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Sprints"
      showBackButton
      onBack={() => navigate("/projects")}
      action={actionButton}
    >
      <SprintHeader
        project={project}
        onViewDetails={() => setViewingProject(project)}
        onManageMeetings={handleManageMeetings}
      />

      {/* Pour les superviseurs, afficher juste le titre sans bouton */}
      {!isStudent && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Sprints</h2>
            <p className="text-muted-foreground mt-1">
              {sprints?.length || 0} sprint(s) in this project
            </p>
          </div>
        </div>
      )}

      {sprints && sprints.length === 0 ? (
        <SprintEmptyState
          onCreate={() => setIsCreateDialogOpen(true)}
          showCreateButton={isStudent}
        />
      ) : (
        <div className="space-y-4">
          {sprints?.map((sprint) => (
            <SprintCard
              key={sprint._id}
              sprint={sprint}
              projectId={project._id}
              onView={setViewingSprint}
              onEdit={setEditingSprint}
              onDelete={setDeletingSprint}
              onStatusChange={(id, newStatus) =>
                updateSprintStatus.mutate({ id, status: newStatus })
              }
              isStatusUpdating={updateSprintStatus.isPending}
              currentUpdatingId={updatingStatusId}
              onGenerateReport={handleGenerateSprintReport}
              isStudent={isStudent}
            />
          ))}
        </div>
      )}

      <ProjectDetailsDialog
        project={viewingProject}
        open={!!viewingProject}
        onOpenChange={(open) => !open && setViewingProject(null)}
      />

      <SprintDetailsDialog
        sprint={viewingSprint}
        open={!!viewingSprint}
        onOpenChange={(open) => !open && setViewingSprint(null)}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
            <DialogDescription>Fill in the information to create a new sprint.</DialogDescription>
          </DialogHeader>
          {createError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}
          <SprintForm
            projectId={project._id}
            onSubmit={(data) => createSprint.mutate(data as any)}
            onCancel={() => {
              setIsCreateDialogOpen(false)
              setCreateError(null)
            }}
            isPending={createSprint.isPending}
            error={createSprint.error}
          />
        </DialogContent>
      </Dialog>

      {isStudent && (
        <Dialog open={!!editingSprint} onOpenChange={(open) => !open && setEditingSprint(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Sprint</DialogTitle>
              <DialogDescription>Update sprint details.</DialogDescription>
            </DialogHeader>
            {editingSprint && (
              <SprintForm
                projectId={project._id}
                sprint={editingSprint}
                onSubmit={(data) => updateSprint.mutate({ id: editingSprint._id, data })}
                onCancel={() => setEditingSprint(null)}
                isPending={updateSprint.isPending}
                error={updateSprint.error}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {isStudent && (
        <AlertDialog
          open={!!deletingSprint}
          onOpenChange={(open) => !open && setDeletingSprint(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is irreversible. Sprint "{deletingSprint?.title}" (Sprint{" "}
                {deletingSprint?.order}) will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingSprint && deleteSprint.mutate(deletingSprint._id)}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteSprint.isPending}
              >
                {deleteSprint.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppLayout>
  )
}
