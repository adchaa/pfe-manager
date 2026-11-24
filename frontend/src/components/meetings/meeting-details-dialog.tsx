import { format } from "date-fns"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { RefModel } from "@/types/enums"
import type { Meeting } from "@/types/meeting.types"

interface MeetingDetailsDialogProps {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const toRefLabel = (model: RefModel) => {
  if (model === RefModel.UserStory) return "User Story"
  if (model === RefModel.Task) return "Task"
  return "Report"
}

export function MeetingDetailsDialog({ meeting, open, onOpenChange }: MeetingDetailsDialogProps) {
  if (!meeting) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Meeting details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Title</p>
            <p className="font-semibold">{meeting.title}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Status</p>
              <Badge variant="outline">{meeting.status}</Badge>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Planned date</p>
              <p>{format(new Date(meeting.plannedDate), "dd MMM yyyy, HH:mm")}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground">Validation</p>
            {meeting.validatedAt ? (
              <p className="text-emerald-700">
                Validated on {format(new Date(meeting.validatedAt), "dd MMM yyyy, HH:mm")}
              </p>
            ) : (
              <p className="text-muted-foreground">Not validated yet</p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground mb-2">References</p>
            {(meeting.refs ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No references for this meeting.</p>
            ) : (
              <div className="space-y-2">
                {meeting.refs?.map((ref, idx) => (
                  <div
                    key={`${ref.referredToModel}-${ref.referredToId}-${idx}`}
                    className="rounded-md border p-2"
                  >
                    <p className="text-sm font-medium">{toRefLabel(ref.referredToModel)}</p>
                    <p className="text-xs text-muted-foreground break-all">{ref.referredToId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
