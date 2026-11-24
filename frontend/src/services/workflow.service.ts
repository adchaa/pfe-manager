import api from "./api"
import type {
  TaskHistory,
  TaskHistoryResponse,
  SingleHistoryResponse,
} from "@/types/workflow.types"

class WorkflowService {
  async getHistoryByTask(taskId: string): Promise<TaskHistory[]> {
    const response = await api.get<TaskHistoryResponse>(`/task-history/task/${taskId}`)
    return response.data.data
  }

  async getHistoryById(historyId: string): Promise<TaskHistory> {
    const response = await api.get<SingleHistoryResponse>(`/task-history/${historyId}`)
    return response.data.data
  }

  async createManualHistoryEntry(data: Partial<TaskHistory>): Promise<TaskHistory> {
    const response = await api.post<SingleHistoryResponse>("/task-history", data)
    return response.data.data
  }
}

const workflowServiceInstance = new WorkflowService()
export default workflowServiceInstance
