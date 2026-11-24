import { Types } from "mongoose"
import { UserStory } from "../models/userStory"
import { Sprint } from "../models/sprint"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"

class UserStoryService {
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
      { $unwind: "$project" },
      {
        $match: {
          $or: [
            { "project.student": new Types.ObjectId(userId) },
            { "project.companySupervisor": new Types.ObjectId(userId) },
            { "project.academicSupervisor": new Types.ObjectId(userId) },
          ],
        },
      },
    ])

    return sprint.length > 0
  }

  async isAuthorizedForUserStory(userId: string, userStoryId: string) {
    const found = await UserStory.aggregate([
      {
        $match: { _id: new Types.ObjectId(userStoryId) },
      },
      {
        $lookup: {
          from: "sprints",
          localField: "sprintId",
          foreignField: "_id",
          as: "sprint",
        },
      },
      { $unwind: "$sprint" },
      {
        $lookup: {
          from: "projects",
          localField: "sprint.projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $match: {
          $or: [
            { "project.student": new Types.ObjectId(userId) },
            { "project.companySupervisor": new Types.ObjectId(userId) },
            { "project.academicSupervisor": new Types.ObjectId(userId) },
          ],
        },
      },
      { $project: { _id: 1 } },
    ])

    return found.length > 0
  }

  async createUserStory(userId: string, data: any) {
    const authorized = await this.isAuthorizedForSprint(userId, data.sprintId)
    if (!authorized) throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)

    const created = await UserStory.create(data)
    return created
  }

  async getUserStoriesBySprint(userId: string, sprintId: string) {
    const authorized = await this.isAuthorizedForSprint(userId, sprintId)
    if (!authorized) throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)

    return UserStory.find({ sprintId }).populate("sprintId")
  }

  async getUserStoryById(userId: string, storyId: string) {
    const authorized = await this.isAuthorizedForUserStory(userId, storyId)
    if (!authorized) throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)

    const story = await UserStory.findById(storyId).populate("sprintId")
    if (!story) throw new HttpError(404, errors.USER_STORY.NOT_FOUND)

    return story
  }

  async updateUserStory(userId: string, storyId: string, update: any) {
    const authorized = await this.isAuthorizedForUserStory(userId, storyId)
    if (!authorized) throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)

    const updated = await UserStory.findByIdAndUpdate(storyId, update, {
      new: true,
      runValidators: true,
    }).populate("sprintId")

    if (!updated) throw new HttpError(404, errors.USER_STORY.NOT_FOUND)

    return updated
  }

  async deleteUserStory(userId: string, storyId: string) {
    const authorized = await this.isAuthorizedForUserStory(userId, storyId)
    if (!authorized) throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)

    await UserStory.findByIdAndDelete(storyId)
    return true
  }
}

export default new UserStoryService()
