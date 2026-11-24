import { z } from "zod"
import { MeetingStatus } from "../models/enums"
import { RefModel } from "../models/enums"

export const referenceSchema = z.object({
  referredToId: z.string().min(1),
  referredToModel: z.enum(Object.values(RefModel)),
})
export type TReferenceSchema = z.infer<typeof referenceSchema>

export const scheduleMeetingSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "The title is required"),
  plannedDate: z.string().transform((val) => new Date(val)),
  status: z.enum(Object.values(MeetingStatus)),
  refs: z.array(referenceSchema).optional(),
})
export type TscheduleMeetingSchema = z.infer<typeof scheduleMeetingSchema>
