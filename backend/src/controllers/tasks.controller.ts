import { Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import {
  TcreateTaskSchema,
  TupdateTaskSchema,
  TupdateTaskStatusSchema,
} from "../schemas/tasks.schema"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import taskService from "../services/task.service"

class TaskController {
  createTask = async (
    req: AuthRequest<never, never, TcreateTaskSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const task = await taskService.createTask(req.user.id, req.body)
      res.status(201).json({ data: task })
    } catch (error) {
      next(error)
    }
  }

  getTaskById = async (
    req: AuthRequest<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const task = await taskService.getTaskById(req.user.id, req.params.id)
      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  }

  getTasksByUserStory = async (
    req: AuthRequest<{ userStoryId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const tasks = await taskService.getTasksByUserStory(
        req.user.id,
        req.params.userStoryId,
      )
      res.json({ data: tasks })
    } catch (error) {
      next(error)
    }
  }

  updateTask = async (
    req: AuthRequest<{ id: string }, never, TupdateTaskSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const updated = await taskService.updateTask(
        req.user.id,
        req.params.id,
        req.body,
      )
      res.json({ data: updated })
    } catch (error) {
      next(error)
    }
  }

  updateTaskStatus = async (
  req: AuthRequest<{ id: string }, never, TupdateTaskStatusSchema>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

    // Extraction de status ET reason depuis le body
    const { status, reason } = req.body 

    const updated = await taskService.updateStatus(
      req.user.id,
      req.params.id,
      status,
      reason // <--- On ajoute le 4ème argument ici
    )
    
    res.json({ data: updated })
  } catch (error) {
    next(error)
  }
}

  deleteTask = async (
    req: AuthRequest<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      await taskService.deleteTask(req.user.id, req.params.id)

      res.json({ success: true, message: "Task deleted successfully" })
    } catch (error) {
      next(error)
    }
  }
}

export default new TaskController()
