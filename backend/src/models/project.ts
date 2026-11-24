import mongoose, { Schema } from "mongoose"
import { ProjectState } from "./enums"

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    state: {
      type: String,
      enum: Object.values(ProjectState),
      default: ProjectState.ACTIVE,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    academicSupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    companySupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export const Project = mongoose.model("Project", projectSchema)
