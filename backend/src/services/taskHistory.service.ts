import { Types } from "mongoose"
import { TaskHistory } from "../models/taskHistory"
import { Task } from "../models/task"
import { User } from "../models/user"
import taskService from "./task.service"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"

class TaskHistoryService {
  async createHistory(
    taskId: string,
    fromStatus: string,
    toStatus: string,
    changedBy: string,
    reason?: string,
  ) {
    const taskExists = await Task.exists({ _id: taskId })
    if (!taskExists) {
      throw new HttpError(404, errors.TASK.NOT_FOUND)
    }

    const userExists = await User.exists({ _id: changedBy })
    if (!userExists) {
      throw new HttpError(404, errors.AUTH.USER_NOT_FOUND)
    }

    if (fromStatus === toStatus) {
      throw new HttpError(400, errors.TASK.STATUS_ALREADY_SET)
    }

    const history = await TaskHistory.create({
      taskId,
      fromStatus,
      toStatus,
      changedBy,
      reason: reason ?? `Status changed from ${fromStatus} to ${toStatus}`,
    })

    return history
  }

  async getHistoryById(historyId: string) {
    const history = await TaskHistory.findById(historyId)
      .populate("taskId", "title status")
      .populate("changedBy", "firstName lastName email")

    if (!history) {
      throw new HttpError(404, errors.TASK.HISTORY_NOT_FOUND)
    }

    return history
  }

  async getHistoryByTask(userId: string, taskId: string) {
    const isAuthorized = await taskService.isAuthorizedForTask(userId, taskId)

    if (!isAuthorized) {
      throw new HttpError(403, errors.AUTH.UNAUTHORIZED)
    }

    const history = await TaskHistory.find({ taskId })
      .sort({ createdAt: -1 })
      .populate("changedBy", "firstName lastName email")
      .populate("taskId", "title status")

    return history
  }
}

export default new TaskHistoryService()
