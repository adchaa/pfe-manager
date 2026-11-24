import mongoose, { Schema } from "mongoose"
import { TaskStatus } from "./enums"

const taskHistorySchema = new Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    fromStatus: { type: String, enum: Object.values(TaskStatus) },
    toStatus: { type: String, enum: Object.values(TaskStatus) },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true },
)

export const TaskHistory = mongoose.model("TaskHistory", taskHistorySchema)
