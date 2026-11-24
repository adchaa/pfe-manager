import api from "./api"
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponse,
  ProjectsResponse,
  UserByEmailResponse,
} from "@/types/project.types"

class ProjectService {
  async getAll(): Promise<Project[]> {
    const response = await api.get<ProjectsResponse>("/projects")
    return response.data.data
  }

  async getMyProject(): Promise<Project> {
    const response = await api.get<ProjectResponse>("/projects/my-project")
    return response.data.data
  }

  async getById(id: string): Promise<Project> {
    const response = await api.get<ProjectResponse>(`/projects/${id}`)
    return response.data.data
  }

  async create(data: CreateProjectDto): Promise<Project> {
    const response = await api.post<ProjectResponse>("/projects", data)
    return response.data.data
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.put<ProjectResponse>(`/projects/${id}`, data)
    return response.data.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`)
  }

  async archive(id: string): Promise<Project> {
    const response = await api.patch<ProjectResponse>(`/projects/${id}/archive`)
    return response.data.data
  }

  async getUserByEmail(email: string): Promise<{
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }> {
    const response = await api.get<UserByEmailResponse>(`/auth/users/by-email/${email}`)
    return response.data.data
  }
}

export default new ProjectService()
