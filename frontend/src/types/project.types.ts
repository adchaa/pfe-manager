import { ProjectState } from "./enums"

export interface UserSummary {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface Project {
  _id: string
  title: string
  description: string
  state: ProjectState
  academicSupervisor: UserSummary
  companySupervisor: UserSummary
  student: UserSummary
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDto {
  title: string
  description: string
  academicSupervisor: string
  companySupervisor: string
  startDate: string
  endDate: string
}

export interface UpdateProjectDto {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  state?: ProjectState
}

export interface ProjectResponse {
  success: boolean
  data: Project
}

export interface ProjectsResponse {
  success: boolean
  data: Project[]
  count: number
}

export interface UserByEmailResponse {
  success: boolean
  data: {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}
