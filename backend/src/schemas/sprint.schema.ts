import z from "zod"
import { SprintStatus } from "../models/enums"

export const createSprintSchema = z.object({
  title: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  order: z.number().int().positive(),
  projectId: z.string().min(1),
})

export const updateSprintSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  order: z.number().int().positive().optional(),
  status: z.enum(Object.values(SprintStatus)).optional(),
})

export type TcreateSprintSchema = z.infer<typeof createSprintSchema>
export type TupdateSprintSchema = z.infer<typeof updateSprintSchema>
