import type { MeetingStatus, RefModel } from "@/types/enums"

export interface MeetingReference {
  referredToId: string
  referredToModel: RefModel
}

export interface Meeting {
  _id: string
  title: string
  plannedDate: string
  status: MeetingStatus
  refs?: MeetingReference[]
  validatedAt?: string
  plannedBy: string
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface CreateMeetingDto {
  projectId: string
  title: string
  plannedDate: string
  status: MeetingStatus
  refs?: MeetingReference[]
}

export interface UpdateMeetingDto {
  title?: string
  plannedDate?: string
  status?: MeetingStatus
  refs?: MeetingReference[]
}

export interface MeetingResponse {
  data: Meeting
}

export interface MeetingsResponse {
  data: Meeting[]
}
