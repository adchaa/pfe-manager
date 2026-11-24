import { Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import taskHistoryService from "../services/taskHistory.service"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"

class TaskHistoryController {
  getHistoryById = async (
    req: AuthRequest<{ historyId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const history = await taskHistoryService.getHistoryById(
        req.params.historyId,
      )

      res.status(200).json({ data: history })
    } catch (error) {
      next(error)
    }
  }

  getHistoryByTask = async (
    req: AuthRequest<{ taskId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const history = await taskHistoryService.getHistoryByTask(
        req.user.id,
        req.params.taskId,
      )

      res.status(200).json({ data: history })
    } catch (error) {
      next(error)
    }
  }
}

export default new TaskHistoryController()
