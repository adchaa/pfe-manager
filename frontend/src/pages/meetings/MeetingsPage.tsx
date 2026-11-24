import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AlertCircle, ArrowLeft, Loader2, LogOut } from "lucide-react"

import authService from "@/services/auth.service"
import meetingService from "@/services/meeting.service"
import projectService from "@/services/project.service"
import sprintService from "@/services/sprint.service"
import userStoryService from "@/services/userStory.service"
import taskService from "@/services/task.service"
import reportService from "@/services/report.service"
import { UserRole } from "@/types/enums"
import type { Meeting } from "@/types/meeting.types"
import type { TscheduleMeetingSchema, TupdateMeetingSchema } from "@/schemas/meeting.schema"

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MeetingActions } from "@/components/meetings/meeting-actions"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingForm } from "@/components/meetings/meeting-form"
import { MeetingDetailsDialog } from "@/components/meetings/meeting-details-dialog"
import { RefModel } from "@/types/enums"
import { AppLayout } from "@/components/layout/app-layout"
import { extractErrorMessage } from "@/lib/error"

export default function MeetingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const currentUser = authService.getCurrentUser()
  const projectIdFromUrl = searchParams.get("projectId") ?? undefined

  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null)
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null)

  const isStudent = currentUser?.role === UserRole.ETUDIANT
  const isAcademicSupervisor = currentUser?.role === UserRole.ENCADRANT_UNIVERSITAIRE

  const { data: project } = useQuery({
    queryKey: ["project", projectIdFromUrl],
    queryFn: () => projectService.getById(projectIdFromUrl!),
    enabled: Boolean(projectIdFromUrl),
  })

  const { data: referenceOptions = [] } = useQuery({
    queryKey: ["meeting-ref-options", projectIdFromUrl],
    enabled: Boolean(projectIdFromUrl),
    queryFn: async () => {
      const [sprints, reports] = await Promise.all([
        sprintService.getSprintsByProject(projectIdFromUrl!),
        reportService.getAllReports(),
      ])

      const userStoryLists = await Promise.all(
        sprints.map((sprint) => userStoryService.getUserStoriesBySprint(sprint._id)),
      )
      const userStories = userStoryLists.flat()

      const taskLists = await Promise.all(
        userStories.map((userStory) => taskService.getTasksByUserStory(userStory._id)),
      )
      const tasks = taskLists.flat()

      const filteredReports = reports.filter((report) => report.projectId === projectIdFromUrl)

      const options = [
        ...userStories.map((us) => ({
          id: us._id,
          label: `${us.title}`,
          model: RefModel.UserStory,
        })),
        ...tasks.map((task) => ({
          id: task._id,
          label: `${task.title}`,
          model: RefModel.Task,
        })),
        ...filteredReports.map((report) => ({
          id: report._id,
          label: `Version ${report.versionNumber}${report.notes ? ` - ${report.notes}` : ""}`,
          model: RefModel.ReportVersion,
        })),
      ]

      return options
    },
  })

  const safeReferenceOptions = useMemo(() => {
    return referenceOptions.map((option) => ({
      ...option,
      label: option.label.length > 90 ? `${option.label.slice(0, 90)}...` : option.label,
    }))
  }, [referenceOptions])

  const {
    data: meetings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meetings", projectIdFromUrl ?? "all"],
    queryFn: () => meetingService.getAll(projectIdFromUrl),
  })

  const createMeeting = useMutation({
    mutationFn: (data: TscheduleMeetingSchema) =>
      meetingService.create({
        ...data,
        plannedDate: new Date(data.plannedDate).toISOString(),
        refs: (data.refs ?? []).filter((ref) => ref.referredToId.trim().length > 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetings", projectIdFromUrl ?? "all"],
      })
      setIsCreateDialogOpen(false)
    },
  })

  const updateMeeting = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TupdateMeetingSchema }) =>
      meetingService.update(id, {
        ...data,
        plannedDate: data.plannedDate ? new Date(data.plannedDate).toISOString() : undefined,
        refs: data.refs?.filter((ref) => ref.referredToId.trim().length > 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetings", projectIdFromUrl ?? "all"],
      })
      setEditingMeeting(null)
    },
  })

  const deleteMeeting = useMutation({
    mutationFn: (id: string) => meetingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetings", projectIdFromUrl ?? "all"],
      })
      setDeletingMeeting(null)
    },
  })

  const validateMeeting = useMutation({
    mutationFn: (id: string) => meetingService.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetings", projectIdFromUrl ?? "all"],
      })
    },
  })

  const filteredMeetings = (meetings ?? [])
    .filter((meeting) => {
      if (statusFilter === "ALL") {
        return true
      }
      return meeting.status === statusFilter
    })
    .sort((a, b) => new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime())

  // if (isLoading) {
  //   return (
  //     <div className="container mx-auto py-8 px-4 max-w-5xl">
  //       <div className="flex items-center justify-center h-64">
  //         <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
  //       </div>
  //     </div>
  //   )
  // }

  if (isLoading) {
    return (
      <AppLayout title="Meetings" subtitle="Loading your data...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading Meetings...</span>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Meetings" subtitle="Error loading data">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error while loading meetings.</AlertDescription>
        </Alert>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Meeting Follow-up"
      subtitle={
        projectIdFromUrl
          ? `Project: ${project?.title ?? "selected project"}`
          : "All accessible meetings"
      }
      showBackButton
      onBack={() => (projectIdFromUrl ? navigate("/projects") : navigate(-1))}
    >
      <div className="space-y-6">
        <MeetingActions
          count={meetings?.length ?? 0}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onCreate={() => setIsCreateDialogOpen(true)}
          canCreate={isStudent && Boolean(projectIdFromUrl)}
        />

        {!projectIdFromUrl && isStudent && (
          <Alert>
            <AlertDescription>
              To plan a meeting, open this page from a specific project.
            </AlertDescription>
          </Alert>
        )}

        {filteredMeetings.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center bg-slate-50">
            <p className="font-medium">No meetings found for this filter.</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isStudent && projectIdFromUrl
                ? "Plan your first meeting to start tracking supervision sessions."
                : "Try another filter or choose a project."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                canEdit={isStudent}
                canValidate={isAcademicSupervisor}
                isValidating={validateMeeting.isPending}
                onView={setViewingMeeting}
                onEdit={setEditingMeeting}
                onDelete={setDeletingMeeting}
                onValidate={(meetingId) => validateMeeting.mutate(meetingId)}
              />
            ))}
          </div>
        )}

        {projectIdFromUrl && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[620px]">
              <DialogHeader>
                <DialogTitle>Plan a new meeting</DialogTitle>
                <DialogDescription>
                  Fill in the meeting details and optionally link references.
                </DialogDescription>
              </DialogHeader>
              <MeetingForm
                projectId={projectIdFromUrl}
                referenceOptions={safeReferenceOptions}
                onSubmit={(data) =>
                  createMeeting.mutate({
                    ...(data as TscheduleMeetingSchema),
                    projectId: projectIdFromUrl,
                  })
                }
                onCancel={() => setIsCreateDialogOpen(false)}
                isPending={createMeeting.isPending}
              />
            </DialogContent>
          </Dialog>
        )}

        <Dialog
          open={Boolean(editingMeeting)}
          onOpenChange={(open) => !open && setEditingMeeting(null)}
        >
          <DialogContent className="sm:max-w-[620px]">
            <DialogHeader>
              <DialogTitle>Edit meeting</DialogTitle>
              <DialogDescription>Update scheduling, status, and references.</DialogDescription>
            </DialogHeader>
            {editingMeeting && (
              <MeetingForm
                projectId={editingMeeting.projectId}
                meeting={editingMeeting}
                referenceOptions={safeReferenceOptions}
                onSubmit={(data) =>
                  updateMeeting.mutate({
                    id: editingMeeting._id,
                    data: data as TupdateMeetingSchema,
                  })
                }
                onCancel={() => setEditingMeeting(null)}
                isPending={updateMeeting.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(deletingMeeting)}
          onOpenChange={(open) => !open && setDeletingMeeting(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this meeting?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone and will permanently remove meeting "
                {deletingMeeting?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => deletingMeeting && deleteMeeting.mutate(deletingMeeting._id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <MeetingDetailsDialog
          meeting={viewingMeeting}
          open={Boolean(viewingMeeting)}
          onOpenChange={(open) => !open && setViewingMeeting(null)}
        />
      </div>
    </AppLayout>
  )
}
