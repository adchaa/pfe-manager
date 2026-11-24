import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import type { MeetingSummary } from "@/types/htmlreport.types"

interface MeetingsSectionProps {
  meetings: MeetingSummary[]
}

function MeetingItem({ meeting }: { meeting: MeetingSummary }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium">{meeting.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(meeting.plannedDate), "dd MMMM yyyy 'at' HH:mm")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline">{meeting.status}</Badge>
        {meeting.plannedBy && (
          <span className="text-xs text-muted-foreground">
            by {meeting.plannedBy.firstName} {meeting.plannedBy.lastName}
          </span>
        )}
      </div>
    </div>
  )
}

export function MeetingsSection({ meetings }: MeetingsSectionProps) {
  if (meetings.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meetings.slice(0, 5).map((meeting) => (
            <MeetingItem key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
