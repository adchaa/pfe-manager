import { Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import htmlReportService from "../services/htmlReport.service"

export const htmlReportController = {
  generateSprintReport: async (
    req: AuthRequest<{ projectId: string; sprintId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const { projectId, sprintId } = req.params

      if (!projectId) {
        return next(new HttpError(400, errors.PROJECT.NO_PROJECT))
      }

      if (!sprintId) {
        return next(new HttpError(400, errors.SPRINT.NOT_FOUND))
      }

      const reportData = await htmlReportService.generateSprintReport(
        req.user.id,
        projectId,
        sprintId,
      )

      res.json({
        success: true,
        data: reportData
      })
    } catch (error) {
      if (error instanceof HttpError) {
        return next(error)
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  },

  generateGlobalReport: async (
    req: AuthRequest<{ projectId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const { projectId } = req.params

      if (!projectId) {
        return next(new HttpError(400, errors.PROJECT.NO_PROJECT))
      }

      const reportData = await htmlReportService.generateGlobalReport(
        req.user.id,
        projectId,
      )

      res.json({
        success: true,
        data: reportData
      })
    } catch (error) {
      if (error instanceof HttpError) {
        return next(error)
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  },
}