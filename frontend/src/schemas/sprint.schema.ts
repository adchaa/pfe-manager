// src/schemas/sprint.schema.ts
import z from "zod"
import { SprintStatus } from "@/types/enums"

export const createSprintSchema = z
  .object({
    title: z.string().min(1, "The title is required").max(100, "The title is too long"),
    startDate: z.string().datetime("Start date is invalid"),
    endDate: z.string().datetime("End date is invalid"),
    order: z.number().int().positive("Order must be a positive number"),
    projectId: z.string().min(1, "The project ID is required"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export const updateSprintSchema = z
  .object({
    title: z.string().min(1, "The title is required").max(100, "The title is too long").optional(),
    startDate: z.string().datetime("Start date is invalid").optional(),
    endDate: z.string().datetime("End date is invalid").optional(),
    order: z.number().int().positive("Order must be a positive number").optional(),
    status: z.enum(Object.values(SprintStatus)).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate)
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

export type TcreateSprintSchema = z.infer<typeof createSprintSchema>
export type TupdateSprintSchema = z.infer<typeof updateSprintSchema>
