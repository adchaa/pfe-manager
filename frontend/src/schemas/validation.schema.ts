import z from "zod"
import { ValidationStatus } from "@/types/enums"

export const createValidationSchema = z.object({
  taskId: z.string(),
  status: z.enum(Object.values(ValidationStatus)),
  meetingId: z.string().optional(),
  note: z.string().optional(),
})
export type TcreateValidationSchema = z.infer<typeof createValidationSchema>
