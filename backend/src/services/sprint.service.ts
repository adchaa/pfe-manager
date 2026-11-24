import { Types } from "mongoose"
import { Sprint } from "../models/sprint"

class SprintService {
  async isAuthorizedForSprint(userId: string, sprintId: string) {
    const sprint = await Sprint.aggregate([
      {
        $match: { _id: new Types.ObjectId(sprintId) },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $match: {
          $or: [
            { "project.student": new Types.ObjectId(userId) },
            { "project.companySupervisor": new Types.ObjectId(userId) },
            { "project.academicSupervisor": new Types.ObjectId(userId) },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ])

    return sprint.length > 0
  }

  async getSprintsByProject(projectId: string) {
    return await Sprint.find({ projectId })
      .populate("projectId", "title description")
      .sort({ order: 1 })
  }
}

export default new SprintService()
