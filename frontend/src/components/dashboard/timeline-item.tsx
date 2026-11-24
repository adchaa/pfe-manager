import { format } from "date-fns";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare,
  type LucideIcon 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TimelineEvent } from "@/types/dashboard.types";

interface TimelineItemProps {
  event: TimelineEvent;
}

const getEventIcon = (type: TimelineEvent["type"]): { icon: LucideIcon; color: string } => {
  switch (type) {
    case "MEETING":
      return { icon: Calendar, color: "bg-blue-100 text-blue-600" };
    case "TASK_STATUS_CHANGE":
      return { icon: CheckCircle, color: "bg-green-100 text-green-600" };
    case "VALIDATION":
      return { icon: MessageSquare, color: "bg-purple-100 text-purple-600" };
    case "REPORT_UPLOAD":
      return { icon: FileText, color: "bg-orange-100 text-orange-600" };
    default:
      return { icon: Clock, color: "bg-gray-100 text-gray-600" };
  }
};

const getEventMessage = (event: TimelineEvent): string => {
  switch (event.type) {
    case "MEETING":
      return `${event.title} ${event.status === "PLANNED" ? "scheduled" : "completed"}`;
    case "TASK_STATUS_CHANGE":
      return `Task "${event.taskTitle}" changed from ${event.fromStatus} to ${event.toStatus}`;
    case "VALIDATION":
      return `Task "${event.taskTitle}" was ${event.isValidated ? "approved" : "rejected"}`;
    case "REPORT_UPLOAD":
      return `Report version ${event.versionNumber} uploaded`;
    default:
      return "Activity";
  }
};

export function TimelineItem({ event }: TimelineItemProps) {
  const { icon: Icon, color } = getEventIcon(event.type);
  const message = getEventMessage(event);
  const user = event.plannedBy || event.changedBy || event.validator || event.uploadedBy;
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "?";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <Avatar className={`h-8 w-8 ${color}`}>
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="w-px h-full bg-gray-200 my-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <time className="text-xs text-gray-400">
            {format(new Date(event.date), "dd MMM yyyy")}
          </time>
        </div>
        {user && (
          <p className="text-xs text-gray-500 mt-1">
            by {user.firstName} {user.lastName}
          </p>
        )}
        {event.notes && (
          <p className="text-xs text-gray-400 mt-1 italic">"{event.notes}"</p>
        )}
      </div>
    </div>
  );
}