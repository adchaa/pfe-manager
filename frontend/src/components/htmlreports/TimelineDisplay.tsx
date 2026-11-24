import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"

interface TimelineEvent {
  type: string
  date: string
  title: string
  description: string
  data?: any
}

interface TimelineViewProps {
  events: TimelineEvent[]
}

function TimelineIcon({ type }: { type: string }) {
  switch (type) {
    case "MEETING":
      return <Calendar className="h-4 w-4 text-blue-500" />
    case "VALIDATION":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "TASK":
      return <RefreshCw className="h-4 w-4 text-orange-500" />
    case "REPORT":
      return <FileText className="h-4 w-4 text-purple-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const getStatusBadge = () => {
    if (event.type === "VALIDATION" && event.description) {
      if (event.description.includes("VALIDATED"))
        return <Badge className="bg-green-100 text-green-700">Validated</Badge>
      if (event.description.includes("REJECTED"))
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
    }
    return null
  }

  return (
    <div className="flex gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="mt-1">
        <TimelineIcon type={event.type} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(event.date), "dd MMM yyyy HH:mm")}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {event.description}
        </p>

        {event.type === "VALIDATION" && event.data?.validator && (
          <p className="text-xs text-muted-foreground mt-2">
            By: {event.data.validator.firstName} {event.data.validator.lastName}
          </p>
        )}

        {event.type === "REPORT" && event.data && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">v{event.data.versionNumber}</Badge>
            {event.data.uploadedBy && (
              <span className="text-xs text-muted-foreground">
                by {event.data.uploadedBy.firstName}{" "}
                {event.data.uploadedBy.lastName}
              </span>
            )}
          </div>
        )}

        {getStatusBadge() && <div className="mt-2">{getStatusBadge()}</div>}
      </div>
    </div>
  )
}

export function TimelineView({ events }: TimelineViewProps) {
  if (!events.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {events.map((event, index) => (
            <TimelineItem key={index} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
