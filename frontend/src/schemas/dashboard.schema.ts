import { z } from "zod"

export const projectStatsParamsSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
})

export type TprojectStatsParamsSchema = z.infer<typeof projectStatsParamsSchema>

export const sprintDetailsParamsSchema = z.object({
  sprintId: z.string().min(1, "Sprint ID is required"),
})

export type TsprintDetailsParamsSchema = z.infer<typeof sprintDetailsParamsSchema>
