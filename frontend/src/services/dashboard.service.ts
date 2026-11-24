import api from "./api"
import type { DashboardOverview, TimelineResponse, DashboardStats } from "@/types/dashboard.types"

class DashboardService {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get("/dashboard/overview")
    return response.data.data
  }

  async getTimeline(): Promise<TimelineResponse> {
    const response = await api.get("/dashboard/timeline")
    return response.data.data
  }

  async getProjectStats(projectId: string): Promise<any> {
    const response = await api.get(`/dashboard/project/${projectId}`)
    return response.data.data
  }

  async getSprintsStats(): Promise<any> {
    const response = await api.get("/dashboard/sprints/stats")
    return response.data.data
  }

  async getProjectsSummary(): Promise<DashboardStats> {
    const response = await api.get("/dashboard/summary")
    return response.data.data
  }

  async getActiveProjects(): Promise<any> {
    const response = await api.get("/dashboard/active-projects")
    return response.data.data
  }
}

export default new DashboardService()
