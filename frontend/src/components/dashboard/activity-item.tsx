// src/components/dashboard/activity-item.tsx
import { formatDistanceToNow } from "date-fns";
import { Calendar, CheckCircle2, Award, FileText, Activity } from "lucide-react";
import type { TimelineEvent } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  event: TimelineEvent;
}

const getActivityConfig = (type: TimelineEvent["type"]) => {
  switch (type) {
    case "MEETING":
      return { icon: Calendar, color: "bg-blue-100 text-blue-600", label: "Meeting" };
    case "TASK_STATUS_CHANGE":
      return { icon: CheckCircle2, color: "bg-green-100 text-green-600", label: "Task Update" };
    case "VALIDATION":
      return { icon: Award, color: "bg-purple-100 text-purple-600", label: "Validation" };
    case "REPORT_UPLOAD":
      return { icon: FileText, color: "bg-orange-100 text-orange-600", label: "Report" };
    default:
      return { icon: Activity, color: "bg-gray-100 text-gray-600", label: "Activity" };
  }
};

const getActivityMessage = (event: TimelineEvent): string => {
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
      return "Activity occurred";
  }
};

const getActorName = (event: TimelineEvent): string => {
  const actor = event.plannedBy || event.changedBy || event.validator || event.uploadedBy;
  if (!actor) return "System";
  return `${actor.firstName} ${actor.lastName}`;
};

export function ActivityItem({ event }: ActivityItemProps) {
  const { icon: Icon, color, label } = getActivityConfig(event.type);
  const message = getActivityMessage(event);
  const actor = getActorName(event);

  return (
    <div className="flex gap-3 py-2">
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">by {actor}</span>
          <span className="text-xs text-gray-300">•</span>
          <time className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
          </time>
        </div>
        {event.notes && (
          <p className="text-xs text-gray-400 italic mt-1">"{event.notes}"</p>
        )}
      </div>
    </div>
  );
}