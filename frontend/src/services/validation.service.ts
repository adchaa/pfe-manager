import api from "@/services/api"
import type {
  CreateValidationDto,
  Validation,
  ValidationResponse,
  ValidationsResponse,
} from "@/types/validation.types"

class ValidationService {
  async createValidation(payload: CreateValidationDto): Promise<Validation> {
    const response = await api.post<ValidationResponse>("/validation", payload)
    return response.data.data
  }

  async getValidationsByTask(taskId: string): Promise<Validation[]> {
    const response = await api.get<ValidationsResponse>(`/validation/task/${taskId}`)
    return response.data.data
  }
}

export default new ValidationService()
