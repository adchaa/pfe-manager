import { TaskStatus, SprintStatus, ProjectState, MeetingStatus, ValidationStatus } from "./enums"

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

export interface ValidationInfo {
  id?: string
  status: ValidationStatus
  validator?: {
    firstName: string
    lastName: string
    role: string
  } | null
  date?: string
  meeting?: {
    title: string
    date: string
  } | null
  note?: string | null
}

export interface TaskReport {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  estimatedHours: number | null
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
  } | null
  validations?: ValidationInfo[]
}

export interface UserStoryReport {
  id: string
  title: string
  description: string | null
  priority: number | null
  sprintId?: string
  tasks: TaskReport[]
  statistics?: {
    totalTasks: number
    doneTasks: number
    progress: number
  }
}

export interface UserStorySummary extends UserStoryReport {
  sprintTitle?: string | null
  statistics: {
    totalTasks: number
    doneTasks: number
    validatedTasks: number
    progress: number
    validationProgress: number
  }
  sprintId?: string
}

export interface SprintSummary {
  id: string
  title: string
  status: SprintStatus
  startDate: string
  endDate: string
  order: number
  statistics: {
    totalTasks: number
    doneTasks: number
    validatedTasks: number
    progress: number
    validationProgress: number
    userStoriesCount: number
  }
}

// ==================== INTERFACES POUR RÉUNIONS ====================

export interface MeetingSummary {
  id: string
  title: string
  plannedDate: string
  status: MeetingStatus
  validatedAt?: string | null
  plannedBy?: {
    id: string
    firstName: string
    lastName: string
  } | null
  createdAt: string
  refs?: Array<{
    model: string
    id: string
  }>
}

// ==================== INTERFACES POUR L'ÉQUIPE ====================

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
}

// ==================== INTERFACES POUR RAPPORT SPRINT ====================

export interface SprintReport {
  project: {
    id: string
    title: string
    description: string | null
    team?: {
      student: TeamMember | null
      academicSupervisor: TeamMember | null
      companySupervisor: TeamMember | null
    }
  }
  sprint: {
    id: string
    title: string
    status: SprintStatus
    startDate: string
    endDate: string
    order: number
    goal?: string | null
  }
  statistics: {
    totalTasks: number
    doneTasks: number
    inProgressTasks: number
    standbyTasks: number
    todoTasks: number
    progress: number
    validatedTasks: number
    pendingValidations: number
    validationRate: number
    userStoriesCount: number
  }
  userStories: UserStoryReport[]
  taskHistory?: Array<{
    taskId: string
    fromStatus: TaskStatus
    toStatus: TaskStatus
    changedBy?: {
      firstName: string
      lastName: string
    } | null
    reason?: string
    date: string
  }>
  generatedAt: string
}

// ==================== INTERFACES POUR RAPPORT GLOBAL ====================

export interface GlobalReport {
  project: {
    id: string
    title: string
    description: string | null
    state: ProjectState
    startDate: string
    endDate: string | null
    createdAt: string
    team: {
      student: TeamMember | null
      academicSupervisor: TeamMember | null
      companySupervisor: TeamMember | null
    }
  }
  statistics: {
    global: {
      totalTasks: number
      doneTasks: number
      inProgressTasks: number
      standbyTasks: number
      todoTasks: number
      progress: number
      validatedTasks: number
      pendingValidations: number
      validationProgress: number
      sprintsCount: number
      userStoriesCount: number
      meetingsCount: number
      reportVersionsCount: number
      totalEstimatedHours: number
      completedHours: number
    }
    byStatus: {
      done: number
      inProgress: number
      standby: number
      todo: number
    }
  }
  pendingValidations?: {
    total: number
    tasks: Array<{
      taskId: string
      taskTitle: string
      userStoryId: string
    }>
  }
  dashboard?: {
    latestMeetings: MeetingSummary[]
    latestReports: Array<{
      versionNumber: number
      fileUrl: string
      notes?: string
      uploadedBy?: {
        firstName: string
        lastName: string
      } | null
      uploadedAt: string
    }>
    timeline: Array<{
      type: string
      date: string
      title: string
      description: string
      data?: any
    }>
  }
  sprints: SprintSummary[]
  userStories: UserStorySummary[]
  meetings: MeetingSummary[]
  generatedAt: string
}
