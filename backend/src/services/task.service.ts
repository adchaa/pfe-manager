import { Types } from "mongoose"
import { Task } from "../models/task"
import { UserStory } from "../models/userStory"
import { User } from "../models/user"
import { TaskHistory } from "../models/taskHistory"
import { TaskStatus } from "../models/enums"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import userStoryService from "./userStory.service"
import taskHistoryService from "./taskHistory.service"

class TaskService {
  async isAuthorizedForTask(userId: string, taskId: string) {
    const task = await Task.aggregate([
      { $match: { _id: new Types.ObjectId(taskId) } },

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
            { "project.student": new Types.ObjectId(userId) },
            { "project.companySupervisor": new Types.ObjectId(userId) },
            { "project.academicSupervisor": new Types.ObjectId(userId) },
          ],
        },
      },

      { $project: { _id: 1 } },
    ])

    return task.length > 0
  }

  async isAuthorizedForTaskCreation(userId: string, userStoryId: string) {
    const story = await UserStory.aggregate([
      { $match: { _id: new Types.ObjectId(userStoryId) } },

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

    return story.length > 0
  }

  async userStoryExists(userStoryId: string) {
    return await UserStory.exists({ _id: userStoryId })
  }

  async userExists(userId: string) {
    return await User.exists({ _id: userId })
  }

  async createTask(userId: string, data: any) {
    const { title, description, userStoryId, estimatedHours, assignedId } = data

    const authorized = await this.isAuthorizedForTaskCreation(
      userId,
      userStoryId,
    )
    if (!authorized) {
      throw new HttpError(403, errors.AUTH.FORBIDDEN_PROJECT_ACCESS)
    }

    if (assignedId) {
      const assignExists = await this.userExists(assignedId)
      if (!assignExists) {
        throw new HttpError(404, errors.TASK.ASSIGNED_USER_NOT_FOUND)
      }
    }

    const task = await Task.create({
      title,
      description,
      userStoryId,
      estimatedHours,
      assignedId,
    })

    return await Task.findById(task._id)
      .populate("assignedId", "firstName lastName email role")
      .populate("userStoryId", "title")
  }

  async getTaskById(userId: string, taskId: string) {
    const task = await Task.findById(taskId)
      .populate("assignedId", "firstName lastName email role")
      .populate("userStoryId", "title")

    if (!task) throw new HttpError(404, errors.TASK.NOT_FOUND)

    const authorized = await this.isAuthorizedForTask(userId, taskId)
    if (!authorized) throw new HttpError(403, errors.AUTH.UNAUTHORIZED)

    return task
  }

  async getTasksByUserStory(userId: string, userStoryId: string) {
    const exists = await UserStory.exists({ _id: userStoryId })
    if (!exists) return null

    const authorized = await userStoryService.isAuthorizedForUserStory(
      userId,
      userStoryId,
    )

    if (!authorized) return false

    const tasks = await Task.find({ userStoryId })
      .populate("assignedId", "firstName lastName email role")
      .populate("userStoryId", "title")

    return tasks
  }

  async updateTask(userId: string, taskId: string, body: any) {
    const task = await Task.findById(taskId)
    if (!task) throw new HttpError(404, errors.TASK.NOT_FOUND)

    const authorized = await this.isAuthorizedForTask(userId, taskId)
    if (!authorized) throw new HttpError(403, errors.AUTH.UNAUTHORIZED)

    if ("status" in body)
      throw new HttpError(400, errors.TASK.STATUS_CANNOT_BE_UPDATED)

    const allowed = ["title", "description", "estimatedHours", "assignedId"]
    const updateData: any = {}
    for (const key of allowed) {
      if (key in body) updateData[key] = body[key]
    }

    return await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedId", "firstName lastName email role")
      .populate("userStoryId", "title")
  }

  // TaskService.ts

async updateStatus(userId: string, taskId: string, newStatus: TaskStatus, reason?: string) {
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, errors.TASK.NOT_FOUND);

  const authorized = await this.isAuthorizedForTask(userId, taskId);
  if (!authorized) throw new HttpError(403, errors.AUTH.UNAUTHORIZED);

  if (task.status === newStatus)
    throw new HttpError(400, errors.TASK.STATUS_ALREADY_SET);

  const previous = task.status;

  task.status = newStatus;
  await task.save();

  // Utilisation de la raison fournie par l'utilisateur s'il y en a une,
  // sinon on garde le message par défaut.
  const historyReason = reason || `Status changed from ${previous} to ${newStatus}`;

  await taskHistoryService.createHistory(
    taskId,
    previous,
    newStatus,
    userId,
    historyReason // On passe la vraie raison ici
  );

  return await Task.findById(taskId)
    .populate("assignedId", "firstName lastName email role")
    .populate("userStoryId", "title");
}

  async deleteTask(userId: string, taskId: string) {
    const task = await Task.findById(taskId)
    if (!task) throw new HttpError(404, errors.TASK.NOT_FOUND)

    const authorized = await this.isAuthorizedForTask(userId, taskId)
    if (!authorized) throw new HttpError(403, errors.AUTH.UNAUTHORIZED)

    if (task.status === TaskStatus.DONE)
      throw new HttpError(400, errors.TASK.TASK_ALREADY_COMPLETED)

    await Task.findByIdAndDelete(taskId)
  }
}

export default new TaskService()
