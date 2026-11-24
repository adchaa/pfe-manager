import api from "./api"
import type {
  CreateMeetingDto,
  Meeting,
  MeetingResponse,
  MeetingsResponse,
  UpdateMeetingDto,
} from "@/types/meeting.types"

class MeetingService {
  async getAll(projectId?: string): Promise<Meeting[]> {
    const response = await api.get<MeetingsResponse>("/meetings")
    const meetings = response.data.data

    if (!projectId) {
      return meetings
    }

    return meetings.filter((meeting) => meeting.projectId === projectId)
  }

  async getById(id: string): Promise<Meeting> {
    const response = await api.get<MeetingResponse>(`/meetings/${id}`)
    return response.data.data
  }

  async create(data: CreateMeetingDto): Promise<Meeting> {
    const response = await api.post<MeetingResponse>("/meetings", data)
    return response.data.data
  }

  async update(id: string, data: UpdateMeetingDto): Promise<Meeting> {
    const response = await api.patch<MeetingResponse>(`/meetings/${id}`, data)
    return response.data.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/meetings/${id}`)
  }

  async validate(id: string): Promise<Meeting> {
    const response = await api.patch<MeetingResponse>(`/meetings/${id}/validate`)
    return response.data.data
  }
}

export default new MeetingService()
