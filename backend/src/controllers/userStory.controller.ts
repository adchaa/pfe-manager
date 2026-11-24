import { Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import {
  TCreateUserStorySchema,
  TUpdateUserStorySchema,
} from "../schemas/userStory.schema"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import userStoryService from "../services/userStory.service"

class UserStoryController {
  createUserStory = async (
    req: AuthRequest<never, never, TCreateUserStorySchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const story = await userStoryService.createUserStory(
        req.user.id,
        req.body,
      )

      res.status(201).json({ data: story })
    } catch (error) {
      next(error)
    }
  }

  getUserStoriesBySprint = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      if (!req.query.sprintId)
        return next(new HttpError(400, errors.VALIDATION.SPRINT_ID_REQUIRED))

      const stories = await userStoryService.getUserStoriesBySprint(
        req.user.id,
        String(req.query.sprintId),
      )

      res.status(200).json({ data: stories })
    } catch (error) {
      next(error)
    }
  }

  getUserStoryById = async (
    req: AuthRequest<{ id: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const story = await userStoryService.getUserStoryById(
        req.user.id,
        req.params.id,
      )

      res.status(200).json({ data: story })
    } catch (error) {
      next(error)
    }
  }

  updateUserStory = async (
    req: AuthRequest<{ id: string }, never, TUpdateUserStorySchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      const updated = await userStoryService.updateUserStory(
        req.user.id,
        req.params.id,
        req.body,
      )

      res.status(200).json({ data: updated })
    } catch (error) {
      next(error)
    }
  }

  deleteUserStory = async (
    req: AuthRequest<{ id: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))

      await userStoryService.deleteUserStory(req.user.id, req.params.id)

      res.status(200).json({
        success: true,
        message: "User Story deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new UserStoryController()
