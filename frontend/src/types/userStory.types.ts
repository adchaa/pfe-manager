// types/userStory.types.ts

//import type { Sprint } from "./sprint.types";

export interface UserStory {
  _id: string
  title: string
  description?: string
  priority: number
  sprintId: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserStoryDto {
  title: string
  description?: string
  priority?: number
  sprintId: string
}

export interface UpdateUserStoryDto {
  title?: string
  description?: string
  priority?: number
}

export interface UserStoryResponse {
  data: UserStory
}

export interface UserStoriesResponse {
  success: boolean
  data: UserStory[]
  count?: number
}

export interface DeleteUserStoryResponse {
  success: boolean
  message: string
}
