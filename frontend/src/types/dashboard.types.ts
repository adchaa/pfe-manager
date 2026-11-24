import { ProjectState, SprintStatus, TaskStatus } from "./enums"

export interface DashboardStats {
  totalProjects: number
  totalSprints: number
  totalTasks: number
  completedTasks: number
  tasksInProgress: number
  tasksBlocked: number
  tasksTodo: number
  completionPercentage: number
  pendingValidations: number
  upcomingMeetings: number
  recentReportVersions: number
}

export interface DashboardProject {
  _id: string
  title: string
  description?: string
  state: ProjectState
  stats: {
    totalTasks: number
    completedTasks: number
    completionPercentage: number
    totalSprints: number
    upcomingMeetings: number
    recentReports: number
  }
  activeSprints: number
  student: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  companySupervisor: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  academicSupervisor: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface TimelineEvent {
  _id: string
  type: "MEETING" | "TASK_STATUS_CHANGE" | "VALIDATION" | "REPORT_UPLOAD"
  date: string
  title?: string
  taskTitle?: string
  fromStatus?: TaskStatus
  toStatus?: TaskStatus
  isValidated?: boolean
  versionNumber?: number
  status?: string
  notes?: string
  plannedBy?: { _id: string; firstName: string; lastName: string }
  changedBy?: { _id: string; firstName: string; lastName: string }
  validator?: { _id: string; firstName: string; lastName: string; role?: string }
  uploadedBy?: { _id: string; firstName: string; lastName: string }
  projectId?: string
}

export interface DashboardOverview {
  projects: DashboardProject[]
  overallStats: DashboardStats
  upcomingMeetings: any[]
  recentReportVersions: any[]
}

export interface SprintStats {
  _id: string
  title: string
  order: number
  status: SprintStatus
  totalUserStories: number
  totalTasks: number
  completedTasks: number
  completionPercentage: number
  startDate?: Date
  endDate?: Date
}

export interface TimelineResponse {
  timeline: TimelineEvent[]
  projects: { _id: string; title: string }[]
}
