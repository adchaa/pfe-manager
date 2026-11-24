import mongoose, { Schema } from "mongoose"
import { ValidationStatus } from "./enums"

const validationSchema = new Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    validatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ValidationStatus),
      required: true,
    },
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
    note: { type: String },
  },
  { timestamps: true },
)

export const Validation = mongoose.model("Validation", validationSchema)
