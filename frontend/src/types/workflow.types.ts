import { TaskStatus } from "./enums"

export interface TaskHistory {
  _id: string
  taskId: string
  fromStatus: TaskStatus | null
  toStatus: TaskStatus
  changedBy:
    | {
        _id: string
        firstName: string
        lastName: string
        email: string
        role: string
      }
    | string
  reason?: string
  createdAt: string
  updatedAt: string
}

export interface TaskHistoryResponse {
  data: TaskHistory[]
}

export interface SingleHistoryResponse {
  data: TaskHistory
}
