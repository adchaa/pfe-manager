import { NextFunction, Response } from "express"
import { TcreateValidationSchema } from "../schemas/validation.schema"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import { Meeting } from "../models/meeting"
import { AuthRequest } from "../middlewares/auth.middleware"
import validationService from "../services/validation.service"
import taskService from "../services/task.service"
import userStoryService from "../services/userStory.service"
import sprintService from "../services/sprint.service"

class ValidationController {
  async createValidation(
    req: AuthRequest<never, never, TcreateValidationSchema>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId, status, meetingId, note } = req.body
      if (
        !(await validationService.isAuthorizedForTaskValidation(
          req.user!.id,
          taskId,
        ))
      ) {
        return next(new HttpError(401, errors.AUTH.FORBIDDEN_USER))
      }

      if (meetingId) {
        const meeting = await Meeting.findById(meetingId)
        if (!meeting) {
          return next(new HttpError(400, errors.VALIDATION.MEETING_NOT_FOUND))
        }
      }
      const validation = await validationService.createValidation(
        {
          taskId,
          status,
          meetingId,
          note,
        },
        req.user!.id,
      )
      res.status(201).json({
        data: validation,
      })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }

  async getValidationsByTaskId(
    req: AuthRequest<{ taskId: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params
      if (!(await taskService.isAuthorizedForTask(req.user!.id, taskId))) {
        return next(new HttpError(401, errors.AUTH.FORBIDDEN_USER))
      }
      const validations = await validationService.getValidationsByTaskId(taskId)
      res.json({
        data: validations,
      })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }

  async getValidationsByUserStoryId(
    req: AuthRequest<{ userStoryId: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { userStoryId } = req.params
      if (
        !(await userStoryService.isAuthorizedForUserStory(
          req.user!.id,
          userStoryId,
        ))
      ) {
        return next(new HttpError(401, errors.AUTH.FORBIDDEN_USER))
      }
      const validations = await validationService.getValidationsByUserStoryId(
        userStoryId,
      )
      res.json({
        data: validations,
      })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }

  getValidationsBySprintId = async (
    req: AuthRequest<{ sprintId: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sprintId } = req.params
      if (
        !(await sprintService.isAuthorizedForSprint(req.user!.id, sprintId))
      ) {
        return next(new HttpError(401, errors.AUTH.FORBIDDEN_USER))
      }
      const validations = await validationService.getValidationsBySprintId(
        sprintId,
      )
      res.json({
        data: validations,
      })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }

  async getValidationById(
    req: AuthRequest<{ validationId: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validationId } = req.params
      const validation = await validationService.getValidationById(validationId)
      res.json({
        data: validation,
      })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }
}

export default new ValidationController()
