import api from "./api"
import type {
  UserStory,
  CreateUserStoryDto,
  UpdateUserStoryDto,
  UserStoryResponse,
  UserStoriesResponse,
  DeleteUserStoryResponse,
} from "@/types/userStory.types"

class UserStoryService {
  async getUserStoriesBySprint(sprintId: string): Promise<UserStory[]> {
    const response = await api.get<UserStoriesResponse>(`/user-stories?sprintId=${sprintId}`)
    return response.data.data
  }

  async getUserStoryById(id: string): Promise<UserStory> {
    const response = await api.get<UserStoryResponse>(`/user-stories/${id}`)
    return response.data.data
  }

  async createUserStory(data: CreateUserStoryDto): Promise<UserStory> {
    const response = await api.post<UserStoryResponse>("/user-stories", data)
    return response.data.data
  }

  async updateUserStory(id: string, data: UpdateUserStoryDto): Promise<UserStory> {
    const response = await api.put<UserStoryResponse>(`/user-stories/${id}`, data)
    return response.data.data
  }

  async deleteUserStory(id: string): Promise<void> {
    await api.delete<DeleteUserStoryResponse>(`/user-stories/${id}`)
  }
}

export default new UserStoryService()
