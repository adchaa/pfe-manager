import { z } from "zod"

export const createUserStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.number().min(0).max(5).default(0),
  sprintId: z.string().optional(),
})
export type TCreateUserStorySchema = z.infer<typeof createUserStorySchema>

export const updateUserStorySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().min(0).max(5).optional(),
  sprintId: z.string().optional(),
})
export type TUpdateUserStorySchema = z.infer<typeof updateUserStorySchema>
