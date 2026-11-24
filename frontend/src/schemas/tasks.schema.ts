import z from "zod"

import { TaskStatus } from "@/types/enums"

export const createTaskSchema = z.object({
  title: z

    .string()

    .min(1, "Title is required")

    .max(100, "Title is too long")

    .optional(),

  description: z

    .string()

    .min(1, "Description is required")

    .max(1000, "Description is too long")

    .optional(),

  userStoryId: z.string().min(1, "User Story ID is required"),

  estimatedHours: z

    .preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),

      z.number().min(0, "Estimated hours must be positive"),
    )

    .optional(),

  supervisorEmail: z

    .string()

    .email("Invalid email format")

    .min(1, "Supervisor email is required"),

  assignedId: z

    .string()

    .min(1, "Assigned user ID is invalid")

    .optional(),
})

export type TcreateTaskSchema = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().max(100, "Title is too long").optional().or(z.literal("")),

  description: z.string().max(1000, "Description is too long").optional().or(z.literal("")),

  userStoryId: z.string().optional(),

  estimatedHours: z
    .preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().min(0, "Estimated hours must be positive").optional(),
    )
    .optional(),

  supervisorEmail: z.string().min(1, "Supervisor email is required").email("Invalid email format"),

  assignedId: z.string().optional().or(z.literal("")),
})

export const updateTaskStatusSchema = z.object({
  status: z.enum(Object.values(TaskStatus) as [string, ...string[]]),
})

export type TupdateTaskStatusSchema = z.infer<typeof updateTaskStatusSchema>
