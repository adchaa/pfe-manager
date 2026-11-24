import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, AlertCircle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

import userStoryService from "@/services/userStory.service"
import sprintService from "@/services/sprint.service"
import { useAuthPermissions } from "@/services/auth.service"

import { UserStoryForm } from "@/components/userStories/userStory-form"
import { UserStoryCard } from "@/components/userStories/userStory-card"
import { UserStoryEmptyState } from "@/components/userStories/userStory-empty-state"
import { UserStoryActions } from "@/components/userStories/userStory-actions"
import { UserStoryDetailsDialog } from "@/components/userStories/userStory-details-dialog"
import { SprintHeader } from "@/components/userStories/sprint-header"
import { SprintDetailsDialog } from "@/components/sprints/sprint-details-dialog"

import type { Sprint } from "@/types/sprint.types"
import type { UserStory } from "@/types/userStory.types"

import { AppLayout } from "@/components/layout/app-layout"
import { extractErrorMessage } from "@/lib/error"

export default function UserStoriesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sprintId = searchParams.get("sprintId")

  const queryClient = useQueryClient()
  const { isStudent } = useAuthPermissions() 

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUserStory, setEditingUserStory] = useState<UserStory | null>(null)
  const [deletingUserStory, setDeletingUserStory] = useState<UserStory | null>(null)
  const [viewingUserStory, setViewingUserStory] = useState<UserStory | null>(null)
  const [viewingSprint, setViewingSprint] = useState<Sprint | null>(null)

  const {
    data: sprint,
    isLoading: isLoadingSprint,
    error: sprintError,
  } = useQuery({
    queryKey: ["sprint", sprintId],
    queryFn: () => sprintService.getSprintById(sprintId!),
    enabled: !!sprintId,
  })

  const {
    data: userStories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userStories", sprintId],
    queryFn: () => userStoryService.getUserStoriesBySprint(sprintId!),
    enabled: !!sprintId,
  })

  const createMutation = useMutation({
    mutationFn: userStoryService.createUserStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories", sprintId] })
      setIsCreateDialogOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userStoryService.updateUserStory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories", sprintId] })
      setEditingUserStory(null)
    },
  })

  const deleteUserStory = useMutation({
    mutationFn: userStoryService.deleteUserStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories", sprintId] })
      setDeletingUserStory(null)
    },
  })

  if (!sprintId) {
    return <div>No sprint selected</div>
  }

  if (isLoadingSprint) {
    return <Loader2 className="animate-spin" />
  }

  if (sprintError || !sprint) {
    return <div>Error loading sprint</div>
  }

  if (isLoading) {
    return (
      <AppLayout title="User Stories" subtitle="Loading...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="User Stories" subtitle="Error loading data">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {extractErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="User Stories" showBackButton onBack={() => navigate(-1)}>
      <div className="container mx-auto py-8 max-w-4xl">

        {/* Sprint */}
        <SprintHeader sprint={sprint} onViewDetails={() => setViewingSprint(sprint)} />

        {/* ACTIONS */}
        <UserStoryActions
          userStoryCount={userStories?.length || 0}
          isStudent={isStudent} 
          onCreate={() => setIsCreateDialogOpen(true)}
        />

        {/* LIST */}
        {userStories?.length === 0 ? (
          <UserStoryEmptyState
            isStudent={isStudent} 
            onCreate={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {[...(userStories || [])]
              .sort((a, b) => a.priority - b.priority)
              .map((us) => (
                <UserStoryCard
                  key={us._id}
                  userStory={us}
                  isStudent={isStudent} 
                  onView={setViewingUserStory}
                  onEdit={setEditingUserStory}
                  onDelete={setDeletingUserStory}
                />
            ))}
          </div>
        )}

        {/* CREATE */}
        {isStudent && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create User Story</DialogTitle>
              </DialogHeader>
              <UserStoryForm
                sprintId={sprint._id}
                onSubmit={(data) => createMutation.mutate(data as any)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* EDIT */}
        {isStudent && (
          <Dialog open={!!editingUserStory} onOpenChange={() => setEditingUserStory(null)}>
            <DialogContent>
              {editingUserStory && (
                <UserStoryForm
                  sprintId={sprint._id}
                  userStory={editingUserStory}
                  onSubmit={(data) =>
                    updateMutation.mutate({ id: editingUserStory._id, data })
                  }
                  onCancel={() => setEditingUserStory(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* DELETE */}
        {isStudent && (
          <AlertDialog open={!!deletingUserStory} onOpenChange={() => setDeletingUserStory(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  User Story "{deletingUserStory?.title}" will be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deletingUserStory &&
                    deleteUserStory.mutate(deletingUserStory._id)
                  }
                  className="bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* VIEW */}
        <UserStoryDetailsDialog
          userStory={viewingUserStory}
          open={!!viewingUserStory}
          onOpenChange={() => setViewingUserStory(null)}
        />

        <SprintDetailsDialog
          sprint={viewingSprint}
          open={!!viewingSprint}
          onOpenChange={() => setViewingSprint(null)}
        />
      </div>
    </AppLayout>
  )
}