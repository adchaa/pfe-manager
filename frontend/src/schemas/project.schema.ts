import z from "zod"
import { ProjectState } from "@/types/enums"

export const createProjectSchema = z.object({
  title: z.string().min(1, "The title is required").max(100, "The title is too long"),
  description: z
    .string()
    .min(1, "The description is required")
    .max(1000, "The description is too long"),
  academicSupervisor: z.string().min(1, "The academic supervisor is required"),
  companySupervisor: z.string().min(1, "The company supervisor is required"),
  startDate: z.string().datetime("Start date is invalid "),
  endDate: z.string().datetime("End date is invalid"),
})
export type TcreateProjectSchema = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  title: z.string().min(1, "The title is required").max(100, "The title is too long").optional(),
  description: z
    .string()
    .min(1, " Description is required")
    .max(1000, "Description is too long")
    .optional(),
  startDate: z.iso.datetime("Start date is invalid").optional(),
  endDate: z.iso.datetime("End date is invalid").optional(),
  state: z.enum(Object.values(ProjectState)).optional(),
})
export type TupdateProjectSchema = z.infer<typeof updateProjectSchema>
