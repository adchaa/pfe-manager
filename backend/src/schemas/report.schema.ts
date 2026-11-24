import { z } from "zod"

export const UpdateReportSchema = z.object({
  notes: z.string().optional(),
})
export type TUpdateReportSchema = z.infer<typeof UpdateReportSchema>
