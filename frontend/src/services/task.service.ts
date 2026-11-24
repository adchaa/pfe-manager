import type { TaskStatus } from "@/types/enums"
import api from "./api"
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  TaskResponse,
  TasksResponse,
  DeleteTaskResponse,
} from "@/types/task.types"

class TaskService {
  async getTasksByUserStory(userStoryId: string): Promise<Task[]> {
    const response = await api.get<TasksResponse>(`/tasks/userStory/${userStoryId}`)
    return response.data.data
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<TaskResponse>(`/tasks/${id}`)
    return response.data.data
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await api.post<TaskResponse>("/tasks", data)
    return response.data.data
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await api.put<TaskResponse>(`/tasks/${id}`, data)
    return response.data.data
  }

  async updateStatus(id: string, status: TaskStatus, reason?: string): Promise<Task> {
    const data: UpdateTaskStatusDto = {
      status,
      reason,
    }

    const response = await api.patch<TaskResponse>(`/tasks/${id}/status`, data)
    return response.data.data
  }

  async deleteTask(id: string): Promise<DeleteTaskResponse> {
    const response = await api.delete<DeleteTaskResponse>(`/tasks/${id}`)
    return response.data
  }
}

const taskServiceInstance = new TaskService()
export default taskServiceInstance
