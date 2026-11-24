import mongoose, { Schema } from "mongoose"

const userStorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: Number, default: 0 },
    sprintId: { type: mongoose.Schema.Types.ObjectId, ref: "Sprint" },
  },
  { timestamps: true },
)

export const UserStory = mongoose.model("UserStory", userStorySchema)
