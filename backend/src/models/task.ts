import mongoose, { Schema } from "mongoose"
import { TaskStatus } from "./enums"

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    userStoryId: { type: mongoose.Schema.Types.ObjectId, ref: "UserStory" },
    estimatedHours: { type: Number },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TO_DO,
    },
    assignedId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export const Task = mongoose.model("Task", taskSchema)
