export const UserRole = {
  ETUDIANT: "ETUDIANT",
  ENCADRANT_UNIVERSITAIRE: "ENCADRANT_UNIVERSITAIRE",
  ENCADRANT_ENTREPRISE: "ENCADRANT_ENTREPRISE",
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const ProjectState = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  COMPLETED: "COMPLETED",
} as const

export type ProjectState = (typeof ProjectState)[keyof typeof ProjectState]

export const SprintStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  DONE: "DONE",
} as const

export type SprintStatus = (typeof SprintStatus)[keyof typeof SprintStatus]

export const TaskStatus = {
  TO_DO: "TODO",
  IN_PROGRESS: "INPROGRESS",
  STANDBY: "STANDBY",
  DONE: "DONE",
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const ValidationStatus = {
  VALIDATED: "VALIDATED",
  REJECTED: "REJECTED",
} as const

export type ValidationStatus = (typeof ValidationStatus)[keyof typeof ValidationStatus]

export const MeetingStatus = {
  PLANNED: "PLANNED",
  HELD: "HELD",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const

export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus]

export const RefModel = {
  ReportVersion: "ReportVersion",
  UserStory: "UserStory",
  Task: "Task",
} as const

export type RefModel = (typeof RefModel)[keyof typeof RefModel]

export const TimelineEventType = {
  MEETING: "MEETING",
  TASK: "TASK",
  REPORT: "REPORT",
  VALIDATION: "VALIDATION",
} as const

export type TimelineEventType = (typeof TimelineEventType)[keyof typeof TimelineEventType]
