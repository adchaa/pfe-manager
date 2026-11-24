import { Types } from "mongoose"
import { Validation } from "../models/validation"
import { TcreateValidationSchema } from "../schemas/validation.schema"
import { Task } from "../models/task"
import { TaskStatus } from "../models/enums"

class ValidationService {
  async isAuthorizedForTaskValidation(userId: string, taskId: string) {
    const task = await Task.aggregate([
      { $match: { _id: new Types.ObjectId(taskId), status: TaskStatus.DONE } },
      {
        $lookup: {
          from: "userstories",
          localField: "userStoryId",
          foreignField: "_id",
          as: "userStory",
        },
      },
      { $unwind: "$userStory" },

      {
        $lookup: {
          from: "sprints",
          localField: "userStory.sprintId",
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
            { "project.companySupervisor": new Types.ObjectId(userId) },
            { "project.academicSupervisor": new Types.ObjectId(userId) },
          ],
        },
      },

      { $project: { _id: 1 } },
    ])

    return task.length > 0
  }

  async getValidationsByUserStoryId(userStoryId: string) {
    const validations = await Validation.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "taskId",
          foreignField: "_id",
          as: "task",
        },
      },
      {
        $unwind: "$task",
      },
      {
        $match: { "task.userStoryId": new Types.ObjectId(userStoryId) },
      },
    ])
    return validations
  }

  async getValidationsBySprintId(sprintId: string) {
    const validations = await Validation.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "taskId",
          foreignField: "_id",
          as: "task",
        },
      },
      {
        $unwind: "$task",
      },
      {
        $lookup: {
          from: "userstories",
          localField: "task.userStoryId",
          foreignField: "_id",
          as: "userStory",
        },
      },
      {
        $unwind: "$userStory",
      },
      {
        $match: { "userStory.sprintId": new Types.ObjectId(sprintId) },
      },
    ])
    return validations
  }

  async getValidationsByTaskId(taskId: string) {
    const validations = await Validation.find({ taskId })
    return validations
  }

  async createValidation(
    validation: TcreateValidationSchema,
    validatorId: string,
  ) {
    return await Validation.create({ ...validation, validatorId })
  }

  async getValidationById(validationId: string) {
    const validation = await Validation.findById(validationId)
    return validation
  }
}

export default new ValidationService()
