import mongoose, { Schema } from "mongoose"
import { MeetingStatus, RefModel } from "./enums"

const refSchema = new Schema({
  referredToId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  referredToModel: {
    type: String,
    enum: Object.values(RefModel),
    required: true,
  },
})

const meetingSchema = new Schema(
  {
    title: { type: String, required: true },
    plannedDate: { type: Date },
    refs: {
      type: [refSchema],
      ref: "ReportVersion",
    },
    status: {
      type: String,
      enum: Object.values(MeetingStatus),
      default: MeetingStatus.PLANNED,
    },
    plannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    validatedAt: { type: Date },
  },
  { timestamps: true },
)

export const Meeting = mongoose.model("Meeting", meetingSchema)
