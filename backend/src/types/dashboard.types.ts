import { Types } from "mongoose"
import {
  TaskStatus,
  MeetingStatus,
  UserRole,
  SprintStatus,
  ProjectState,
} from "../models/enums"

export interface BasicProjectInfo {
  _id: Types.ObjectId
  title: string
  description?: string | null
  state?: ProjectState
}

export interface ProjectMember {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email?: string
  role?: UserRole
}

export interface PopulatedProject {
  _id: Types.ObjectId
  title: string
  description?: string | null
  state?: ProjectState
  student: ProjectMember
  companySupervisor: ProjectMember
  academicSupervisor: ProjectMember
  createdAt?: Date
  updatedAt?: Date
}

export interface TimelineMeeting {
  _id: Types.ObjectId
  type: "MEETING"
  date: Date
  title: string
  status: MeetingStatus
  plannedBy: ProjectMember | Types.ObjectId | null
  validatedAt?: Date | null
  projectId: Types.ObjectId | null
  meetingType?: string
}

export interface TimelineTaskHistory {
  _id: Types.ObjectId
  type: "TASK_STATUS_CHANGE"
  date: Date
  taskTitle: string
  fromStatus: TaskStatus
  toStatus: TaskStatus
  changedBy: ProjectMember
  projectId: Types.ObjectId
}

export interface TimelineValidation {
  _id: Types.ObjectId
  type: "VALIDATION"
  date: Date
  taskTitle: string
  isValidated: boolean
  validator: (ProjectMember & { role?: string }) | Types.ObjectId
  projectId: Types.ObjectId | null
}


export interface TimelineReport {
  _id: Types.ObjectId
  type: "REPORT_UPLOAD"
  date: Date
  versionNumber: number
  uploadedBy: ProjectMember | Types.ObjectId | null
  notes?: string
  projectId: Types.ObjectId | null
  fileName?: string
}


export type TimelineEvent =
  | TimelineMeeting
  | TimelineTaskHistory
  | TimelineValidation
  | TimelineReport

export interface TasksStatistics {
  _id: Types.ObjectId
  totalTasks: number
  completedTasks: number
  tasksInProgress: number
  tasksBlocked: number
  tasksTodo: number
}

export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  tasksInProgress: number
  tasksBlocked: number
  tasksTodo: number
  completionPercentage: number
  totalSprints: number
  upcomingMeetings: number
  recentReports: number
  activeSprints?: number
}

export interface SprintBasicInfo {
  _id: Types.ObjectId
  title: string
  order: number
  status: SprintStatus
  projectId: Types.ObjectId | null 
  startDate?: Date
  endDate?: Date
}

export interface SprintStats extends SprintBasicInfo {
  totalUserStories: number
  totalTasks: number
  completedTasks: number
  completionPercentage: number
  description?: string
  createdAt?: Date
}

export interface UserStoryStats {
  _id: Types.ObjectId
  userStoryTitle: string
  sprintId: Types.ObjectId
  sprintTitle: string
  totalTasks: number
  completedTasks: number
  tasksInProgress: number
  tasksBlocked: number
  tasksTodo?: number
}

export interface ValidationSummary {
  validated: number
  pending: number
}

export interface TaskByStatus {
  _id: TaskStatus
  count: number
  tasks: Array<{
    _id: Types.ObjectId
    title: string
    userStoryId: Types.ObjectId
    sprintId: Types.ObjectId
  }>
}

export interface ValidationGroup {
  _id: boolean
  count: number
  validations: Array<{
    _id: Types.ObjectId
    taskId: Types.ObjectId
    taskTitle: string
    validator: ProjectMember & { role?: string }
    createdAt: Date
    meetingId?: Types.ObjectId
  }>
}

export interface TimelineResponse {
  timeline: TimelineEvent[]
  projects: BasicProjectInfo[]
}

export interface DashboardOverview {
  projects: Array<
    PopulatedProject & {
      stats: ProjectStats
      activeSprints: number
    }
  >
  overallStats: {
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
  upcomingMeetings: any[]
  recentReportVersions: any[]
}

export interface ProjectDetailsResponse {
  project: PopulatedProject | null
  stats: {
    totalSprints: number
    totalUserStories: number
    totalTasks: number
    tasksByStatus: TaskByStatus[]
    validationsSummary: ValidationSummary
    totalMeetings: number
    totalReportVersions: number
  }
  sprints: SprintStats[]
  userStories: UserStoryStats[]
  recentMeetings: any[]
  recentReportVersions: any[]
  validations: ValidationGroup[]
}

export interface ProjectsSummary {
  totalProjects: number
  activeSprints: number
  totalTasks: number
  completionRate: number
  pendingValidations: number
  upcomingMeetings: number
  recentReports: number
}

export interface ActiveProjectsResponse {
  activeProjects: Array<
    PopulatedProject & {
      activeSprints: number
      totalSprints: number
      completionRate: number
    }
  >
  totalActiveProjects: number
}

export interface SprintDetailsResponse {
  sprint: SprintBasicInfo
  userStories: UserStoryStats[]
  tasksByStatus: Array<{ status: TaskStatus; count: number }>
}

export interface SprintsStatsResponse {
  sprintsStats: SprintStats[]
  projects: BasicProjectInfo[]
}
