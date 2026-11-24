import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { UserStory } from "@/types/userStory.types"

interface UserStoryDetailsDialogProps {
  userStory: UserStory | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserStoryDetailsDialog({
  userStory,
  open,
  onOpenChange,
}: UserStoryDetailsDialogProps) {
  if (!userStory) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Story Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                User Story : {userStory.title}
              </h2>
              <div className="mt-2">{userStory.description}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Priority : {userStory.priority}{" "}
            </h3>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
