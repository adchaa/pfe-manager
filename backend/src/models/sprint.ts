import mongoose, { Schema } from "mongoose"
import { SprintStatus } from "./enums"

const sprintSchema = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(SprintStatus),
      default: SprintStatus.PLANNED,
    },
  },
  { timestamps: true },
)

export const Sprint = mongoose.model("Sprint", sprintSchema)
