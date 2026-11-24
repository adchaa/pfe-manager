import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Target,
  Calendar,
  Clock,
  Plus,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

import taskService from "@/services/task.service"
import userStoryService from "@/services/userStory.service"
import projectService from "@/services/project.service"
import validationService from "@/services/validation.service"

import { TaskForm } from "@/components/tasks/task-form"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskHeader } from "@/components/tasks/task-header"
import { TaskDetailsDialog } from "@/components/tasks/task-details-dialog"

import { TaskStatus, ValidationStatus } from "@/types/enums"
import type { CreateTaskDto, Task, UpdateTaskDto } from "@/types/task.types"
import type { CreateValidationDto } from "@/types/validation.types"
import { toast } from "sonner"
import authService, { useAuthPermissions } from "@/services/auth.service"
import { AppLayout } from "@/components/layout/app-layout"
import { extractErrorMessage } from "@/lib/error"

export default function TasksPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const usIdFromUrl = searchParams.get("userStoryId")
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  const [isUSDetailsOpen, setIsUSDetailsOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [customError, setCustomError] = useState<string | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [openInWorkflowMode, setOpenInWorkflowMode] = useState(false)

  const { isStudent } = useAuthPermissions()
  const queryClient = useQueryClient()

  const { data: userStory, isLoading: isLoadingUS } = useQuery({
    queryKey: ["userStory", usIdFromUrl],
    queryFn: () => userStoryService.getUserStoryById(usIdFromUrl!),
    enabled: !!usIdFromUrl,
  })

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", usIdFromUrl],
    queryFn: () => taskService.getTasksByUserStory(usIdFromUrl!),
    enabled: !!usIdFromUrl,
  })

  const createTask = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", usIdFromUrl] })
      setIsCreateDialogOpen(false)
      setCustomError(null)
      toast.success("Task created successfully")
    },
  })

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", usIdFromUrl] })
      setEditingTask(null)
      setCustomError(null)
      toast.success("Task updated successfully")
    },
    onError: () => {
      toast.error("Update failed", {
        description: "An error occurred while saving changes.",
      })
    },
  })

  const validationMutation = useMutation({
    mutationFn: (payload: CreateValidationDto) =>
      validationService.createValidation(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", usIdFromUrl] })
      queryClient.invalidateQueries({
        queryKey: ["task-validations", variables.taskId],
      })
      toast.success(
        variables.status === ValidationStatus.VALIDATED
          ? "Task validated successfully"
          : "Task rejected successfully",
      )
    },
  })

  const handleTaskSubmit = async (
    values: {
      title: string
      description?: string
      userStoryId: string
      estimatedHours: number | string
      supervisorEmail: string
    },
    taskId?: string,
  ) => {
    try {
      const user = await projectService.getUserByEmail(values.supervisorEmail)

      if (!user || !user._id) {
        throw new Error("User not found")
      }

      const payload: CreateTaskDto = {
        title: values.title,
        description: values.description || "",
        userStoryId: values.userStoryId,
        estimatedHours: Number(values.estimatedHours),
        assignedId: user._id,
      }

      if (taskId) {
        await updateTask.mutateAsync({ id: taskId, data: payload })
      } else {
        await createTask.mutateAsync(payload)
      }
    } catch (err) {
      throw err
    }
  }

  const deleteTask = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", usIdFromUrl] })
      setDeletingTask(null)
      toast.success("Task deleted successfully")
    },
  })

  const updateTaskStatus = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string
      status: TaskStatus
      reason?: string
    }) => taskService.updateStatus(id, status, reason),
    onMutate: ({ id }) => {
      setUpdatingStatusId(id)
    },
    onSuccess: () => {
      toast.success("Status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["tasks", usIdFromUrl] })
    },
    onSettled: () => {
      setUpdatingStatusId(null)
    },
  })
  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleValidate = (taskId: string, note?: string) => {
    validationMutation.mutate({
      taskId,
      status: ValidationStatus.VALIDATED,
      note,
    })
  }

  const handleReject = (taskId: string, note?: string) => {
    validationMutation.mutate({
      taskId,
      status: ValidationStatus.REJECTED,
      note,
    })
  }

  if (isLoadingUS) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
 if (!usIdFromUrl || !userStory) {
  const errorMessage = !usIdFromUrl
    ? "NO USER STORY Selected."
    : "User Story not found";

  return (
    <AppLayout title="Tasks" showBackButton onBack={() => navigate(-1)}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error: {extractErrorMessage(new Error(errorMessage))}
        </AlertDescription>
      </Alert>

      <Button className="mt-4" onClick={() => navigate(-1)}>
        Back to Userstories
      </Button>
    </AppLayout>
  );
}
  const totalTasks = tasks?.length || 0
  const todoTasks =
    tasks?.filter((t) => t.status === TaskStatus.TO_DO).length || 0
  const doneTasks =
    tasks?.filter((t) => t.status === TaskStatus.DONE).length || 0
  const inProgressTasks =
    tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0

  const filteredByStatus =
    tasks?.filter((task) => {
      if (activeFilter === "ALL") return true
      return task.status === activeFilter
    }) || []
  const filteredTasks = [...filteredByStatus].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })

  const handleViewTask = (task: Task) => {
    setOpenInWorkflowMode(false)
    setViewingTask(task)
  }

  const handleViewWorkflow = (task: Task) => {
    setOpenInWorkflowMode(true)
    setViewingTask(task)
  }
  return (
     <AppLayout
     title="Tasks"
    showBackButton
    onBack={() => navigate(-1)}

  >
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      

      {userStory && (
        <div className="mb-6">
          <TaskHeader
            userStory={userStory}
            onViewDetails={() => setIsUSDetailsOpen(true)}
          />
        </div>
      )}

      <div className="mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {/* Carte Total */}
            <div
              onClick={() => setActiveFilter("ALL")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl min-w-[110px] cursor-pointer transition-all border ${
                activeFilter === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white border-slate-200 text-slate-900 hover:border-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${activeFilter === "ALL" ? "bg-slate-700" : "bg-slate-50"}`}
              >
                <Target
                  className={`h-4 w-4 ${activeFilter === "ALL" ? "text-white" : "text-slate-600"}`}
                />
              </div>
              <div>
                <p
                  className={`text-[9px] font-bold uppercase leading-none mb-1 ${activeFilter === "ALL" ? "text-slate-300" : "text-slate-500"}`}
                >
                  Total
                </p>
                <p className="text-base font-black leading-none">
                  {totalTasks}
                </p>
              </div>
            </div>

            {/* Carte To Do  */}
            <div
              onClick={() => setActiveFilter("TODO")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl min-w-[110px] cursor-pointer transition-all border ${
                activeFilter === "TODO"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white border-blue-100 text-blue-900 hover:border-blue-300"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${activeFilter === "TODO" ? "bg-blue-500" : "bg-blue-50"}`}
              >
                <Clock
                  className={`h-4 w-4 ${activeFilter === "TODO" ? "text-white" : "text-blue-600"}`}
                />
              </div>
              <div>
                <p
                  className={`text-[9px] font-bold uppercase leading-none mb-1 ${activeFilter === "TO_DO" ? "text-blue-100" : "text-blue-600"}`}
                >
                  To Do
                </p>
                <p className="text-base font-black leading-none">{todoTasks}</p>
              </div>
            </div>

            {/* Carte In Progress */}
            <div
              onClick={() => setActiveFilter("INPROGRESS")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl min-w-[110px] cursor-pointer transition-all border ${
                activeFilter === "INPROGRESS"
                  ? "bg-amber-500 text-white border-amber-500 shadow-md"
                  : "bg-white border-amber-100 text-amber-900 hover:border-amber-300"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${activeFilter === "INPROGRESS" ? "bg-amber-400" : "bg-amber-50"}`}
              >
                <Loader2
                  className={`h-4 w-4 ${activeFilter === "INPROGRESS" ? "text-white" : "text-amber-600"}`}
                />
              </div>
              <div>
                <p
                  className={`text-[9px] font-bold uppercase leading-none mb-1 ${activeFilter === "INPROGRESS" ? "text-amber-50" : "text-amber-600"}`}
                >
                  In Progress
                </p>
                <p className="text-base font-black leading-none">
                  {inProgressTasks}
                </p>
              </div>
            </div>

            {/* Carte Done */}
            <div
              onClick={() => setActiveFilter("DONE")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl min-w-[110px] cursor-pointer transition-all border ${
                activeFilter === "DONE"
                  ? "bg-green-600 text-white border-green-600 shadow-md"
                  : "bg-white border-green-100 text-green-900 hover:border-green-300"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${activeFilter === "DONE" ? "bg-green-500" : "bg-green-50"}`}
              >
                <Plus
                  className={`h-4 w-4 rotate-45 ${activeFilter === "DONE" ? "text-white" : "text-green-600"}`}
                />
              </div>
              <div>
                <p
                  className={`text-[9px] font-bold uppercase leading-none mb-1 ${activeFilter === "DONE" ? "text-green-100" : "text-green-600"}`}
                >
                  Done
                </p>
                <p className="text-base font-black leading-none">{doneTasks}</p>
              </div>
            </div>
          </div>

          {/* Bouton Add New Task */}
          {isStudent && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-11 px-5 rounded-xl shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="font-semibold text-sm">New Task</span>
            </Button>
          )}
        </div>
      </div>

      {customError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{customError}</AlertDescription>
        </Alert>
      )}

      {isLoadingTasks ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {tasks?.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
              <p className="text-gray-500 font-medium">
                No tasks found for this story.
              </p>
              <p className="text-sm text-gray-400">
                Click "Add New Task" to get started.
              </p>
            </div>
          ) : filteredTasks?.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="text-gray-500 font-medium">
                No tasks found with status:{" "}
                <span className="font-bold">{activeFilter}</span>
              </p>
              <Button
                variant="link"
                onClick={() => setActiveFilter("ALL")}
                className="text-primary mt-2"
              >
                Clear filter and show all tasks
              </Button>
            </div>
          ) : (
            filteredTasks?.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onView={handleViewTask}
                onViewWorkflow={handleViewWorkflow}
                onEdit={isStudent ? setEditingTask : undefined}
                onDelete={isStudent ? setDeletingTask : undefined}
                onStatusChange={(id, newStatus, reason) =>
                  updateTaskStatus.mutate({ id, status: newStatus, reason })
                }
                isStatusUpdating={updateTaskStatus.isPending}
                currentUpdatingId={updatingStatusId}
                isStudent={isStudent}
                isSupervisor={!isStudent}
                onValidate={handleValidate}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      )}

      <TaskDetailsDialog
        task={viewingTask}
        open={!!viewingTask}
        onOpenChange={(open) => {
          if (!open) {
            setViewingTask(null)
            setOpenInWorkflowMode(false)
          }
        }}
        initialViewWorkflow={openInWorkflowMode}
      />

      {/* Create Dialog */}
      {isStudent && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
              <DialogDescription>
                Add a new task for this User Story.
              </DialogDescription>
            </DialogHeader>
            {userStory && (
              <TaskForm
                userStoryId={userStory._id}
                onSubmit={(data) => handleTaskSubmit(data)}
                onCancel={() => setIsCreateDialogOpen(false)}
                isPending={createTask.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isStudent && (
        <Dialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update the details of this task.
              </DialogDescription>
            </DialogHeader>
            {userStory && editingTask && (
              <TaskForm
                userStoryId={userStory._id}
                task={editingTask}
                onSubmit={(data) => handleTaskSubmit(data, editingTask._id)}
                onCancel={() => setEditingTask(null)}
                isPending={updateTask.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deletingTask && deleteTask.mutate(deletingTask._id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* US Details Dialog */}
      <Dialog open={isUSDetailsOpen} onOpenChange={setIsUSDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {userStory && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <Target className="h-5 w-5 text-primary" />
                  User Story Information
                </DialogTitle>
                <DialogDescription>
                  Detailed overview of planning.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Title
                  </h4>
                  <p className="text-xl font-bold">{userStory.title}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Description
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {userStory.description || "No description provided."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Priority
                    </h4>
                    <Badge
                      variant={
                        userStory.priority >= 3 ? "destructive" : "default"
                      }
                    >
                      Level {userStory.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Sprint
                    </h4>
                    <p className="font-medium">
                      {(userStory.sprintId as any)?.title || "Active Sprint"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <div className="text-xs">
                      <p className="font-semibold uppercase text-[10px]">
                        Created
                      </p>
                      <p>
                        {userStory.createdAt
                          ? new Date(userStory.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <div className="text-xs">
                      <p className="font-semibold uppercase text-[10px]">
                        Last Updated
                      </p>
                      <p>
                        {userStory.updatedAt
                          ? new Date(userStory.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsUSDetailsOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  )
}
