import z from "zod"
import { TaskStatus } from "../models/enums"

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(100, "Le titre est trop long")
    .optional(),

  description: z
    .string()
    .min(1, "La description est requise")
    .max(1000, "La description est trop longue")
    .optional(),

  userStoryId: z.string().min(1, "L'ID de la user story est requis"),

  estimatedHours: z
    .preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().min(0, "Les heures estimées doivent être positives"),
    )
    .optional(),

  assignedId: z
    .string()
    .min(1, "L'ID de l'utilisateur assigné est invalide")
    .optional(),
})

export type TcreateTaskSchema = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(100, "Le titre est trop long")
    .optional(),

  description: z
    .string()
    .min(1, "La description est requise")
    .max(1000, "La description est trop longue")
    .optional(),

  userStoryId: z.string().min(1, "L'ID de la user story est requis").optional(),

  estimatedHours: z
    .preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().min(0, "Les heures estimées doivent être positives"),
    )
    .optional(),

  assignedId: z
    .string()
    .min(1, "L'ID de l'utilisateur assigné est invalide")
    .optional(),
})

export type TupdateTaskSchema = z.infer<typeof updateTaskSchema>

export const updateTaskStatusSchema = z.object({
  status: z.enum(Object.values(TaskStatus)),
  reason: z.string().optional(),
})

export type TupdateTaskStatusSchema = z.infer<typeof updateTaskStatusSchema>
