import api from "./api"
import type {
  Sprint,
  CreateSprintDto,
  UpdateSprintDto,
  SprintResponse,
  SprintsResponse,
  DeleteSprintResponse,
} from "@/types/sprint.types"

class SprintService {
  async getSprintsByProject(projectId: string): Promise<Sprint[]> {
    const response = await api.get<SprintsResponse>(`/sprints/project/${projectId}`)
    return response.data.data
  }

  async getSprintById(id: string): Promise<Sprint> {
    const response = await api.get<SprintResponse>(`/sprints/${id}`)
    return response.data.data
  }

  async createSprint(data: CreateSprintDto): Promise<Sprint> {
    try {
      const response = await api.post<SprintResponse>("/sprints", data)
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }

  async updateSprint(id: string, data: UpdateSprintDto): Promise<Sprint> {
    try {
      const response = await api.put<SprintResponse>(`/sprints/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }

  async deleteSprint(id: string): Promise<DeleteSprintResponse> {
    const response = await api.delete<DeleteSprintResponse>(`/sprints/${id}`)
    return response.data
  }
}

export default new SprintService()
