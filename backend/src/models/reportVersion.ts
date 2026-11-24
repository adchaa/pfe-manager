import mongoose, { Schema } from "mongoose"

const reportVersionSchema = new Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    versionNumber: { type: Number, required: true },
    fileUrl: { type: String },
    originalFileName: { type: String },
    notes: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export const ReportVersion = mongoose.model(
  "ReportVersion",
  reportVersionSchema,
)
