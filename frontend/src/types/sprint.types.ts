import { SprintStatus } from "./enums"

export interface Sprint {
  goal: import("react/jsx-runtime").JSX.Element
  _id: string
  title: string
  startDate: string
  endDate: string
  order: number
  projectId: string
  status: SprintStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateSprintDto {
  title: string
  startDate: string
  endDate: string
  order: number
  projectId: string
}

export interface UpdateSprintDto {
  title?: string
  startDate?: string
  endDate?: string
  order?: number
  status?: SprintStatus
}

export interface SprintResponse {
  data: Sprint
}

export interface SprintsResponse {
  data: Sprint[]
}

export interface DeleteSprintResponse {
  success: boolean
  message: string
}
