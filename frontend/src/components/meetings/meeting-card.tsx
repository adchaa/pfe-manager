import { Calendar, CheckCircle2, Eye, Trash2, Pencil } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MeetingStatus, RefModel } from "@/types/enums"
import type { Meeting } from "@/types/meeting.types"

interface MeetingCardProps {
  meeting: Meeting
  canEdit: boolean
  canValidate: boolean
  isValidating: boolean
  onView: (meeting: Meeting) => void
  onEdit: (meeting: Meeting) => void
  onDelete: (meeting: Meeting) => void
  onValidate: (meetingId: string) => void
}

const getStatusClassName = (status: MeetingStatus) => {
  if (status === MeetingStatus.PLANNED) {
    return "bg-blue-100 text-blue-700"
  }
  if (status === MeetingStatus.HELD) {
    return "bg-amber-100 text-amber-700"
  }
  if (status === MeetingStatus.COMPLETED) {
    return "bg-emerald-100 text-emerald-700"
  }
  return "bg-rose-100 text-rose-700"
}

const toRefLabel = (model: RefModel) => {
  if (model === RefModel.UserStory) return "User Story"
  if (model === RefModel.Task) return "Task"
  return "Report"
}

export function MeetingCard({
  meeting,
  canEdit,
  canValidate,
  isValidating,
  onView,
  onEdit,
  onDelete,
  onValidate,
}: MeetingCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold">{meeting.title}</h3>
            <Badge className={getStatusClassName(meeting.status)}>{meeting.status}</Badge>
            {meeting.validatedAt && (
              <Badge className="bg-emerald-100 text-emerald-700">Validated</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(meeting.plannedDate), "dd MMM yyyy, HH:mm")}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {(meeting.refs ?? []).length === 0 ? (
              <Badge variant="outline">No references</Badge>
            ) : (
              meeting.refs?.map((ref, idx) => (
                <Badge variant="outline" key={`${ref.referredToModel}-${ref.referredToId}-${idx}`}>
                  {toRefLabel(ref.referredToModel)}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onView(meeting)} title="View details">
            <Eye className="h-4 w-4" />
          </Button>

          {canValidate && !meeting.validatedAt && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onValidate(meeting._id)}
              disabled={isValidating}
              title="Validate meeting"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </Button>
          )}

          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(meeting)}
                title="Edit meeting"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(meeting)}
                title="Delete meeting"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
