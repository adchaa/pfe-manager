import { TaskStatus } from "./enums"

export interface Task {
  _id: string
  title: string
  description: string
  userStoryId: string
  estimatedHours?: number
  assignedId?: string
  status: TaskStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateTaskDto {
  title?: string
  description?: string
  userStoryId: string
  estimatedHours?: number
  assignedId?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  userStoryId?: string
  estimatedHours?: number
  assignedId?: string
}

export interface UpdateTaskStatusDto {
  status: TaskStatus
  reason?: string
}

export interface TaskResponse {
  data: Task
}

export interface TasksResponse {
  data: Task[]
}

export interface DeleteTaskResponse {
  success: boolean
  message: string
}
