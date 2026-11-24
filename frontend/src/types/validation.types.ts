import type { ValidationStatus } from "@/types/enums"

export interface Validation {
  _id: string
  taskId: string
  validatorId: string
  status: ValidationStatus
  note?: string
  meetingId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateValidationDto {
  taskId: string
  status: ValidationStatus
  note?: string
}

export interface ValidationResponse {
  data: Validation
}

export interface ValidationsResponse {
  data: Validation[]
}
