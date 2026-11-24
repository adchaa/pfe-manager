import { z } from "zod"
import { MeetingStatus } from "@/types/enums"
import { RefModel } from "@/types/enums"

export const referenceSchema = z.object({
  referredToId: z.string().min(1),
  referredToModel: z.enum(Object.values(RefModel)),
})
export type TReferenceSchema = z.infer<typeof referenceSchema>

export const scheduleMeetingSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "The title is required"),
  plannedDate: z.string().min(1, "The date is required"),
  status: z.enum(Object.values(MeetingStatus)),
  refs: z.array(referenceSchema).optional(),
})
export type TscheduleMeetingSchema = z.infer<typeof scheduleMeetingSchema>

export const updateMeetingSchema = z.object({
  title: z.string().min(1, "The title is required").optional(),
  plannedDate: z.string().min(1, "The date is required").optional(),
  status: z.enum(Object.values(MeetingStatus)).optional(),
  refs: z.array(referenceSchema).optional(),
})

export type TupdateMeetingSchema = z.infer<typeof updateMeetingSchema>
