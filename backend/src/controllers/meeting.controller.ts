import { tr } from "zod/v4/locales"
import { AuthRequest } from "../middlewares/auth.middleware"
import { TscheduleMeetingSchema } from "../schemas/meeting.schema"
import { NextFunction, Response } from "express"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import meetingService from "../services/meeting.service"

class MeetingController {
  async scheduleMeeting(
    req: AuthRequest<never, never, TscheduleMeetingSchema>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user
      const meeting = await meetingService.scheduleMeeting(req.body, user!.id)
      return res.status(201).json({
        data: meeting,
      })
    } catch (error: any) {
      if (error.message === errors.PROJECT.NO_PROJECT.message) {
        return next(new HttpError(400, errors.PROJECT.NO_PROJECT))
      }
      if (error.message === errors.VALIDATION.USER_STORY_NOT_FOUND.message) {
        return next(new HttpError(400, errors.VALIDATION.USER_STORY_NOT_FOUND))
      }
      if (error.message === errors.VALIDATION.TASK_NOT_FOUND.message) {
        return next(new HttpError(400, errors.VALIDATION.TASK_NOT_FOUND))
      }
      if (error.message === errors.VALIDATION.REPORT_NOT_FOUND.message) {
        return next(new HttpError(400, errors.VALIDATION.REPORT_NOT_FOUND))
      }
      if (error.message === errors.AUTH.UNAUTHORIZED.message) {
        return next(new HttpError(403, errors.AUTH.UNAUTHORIZED))
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getMeetingById(
    req: AuthRequest<{ id: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user
      const { id } = req.params
      const meeting = await meetingService.getMeetingById(id, user!.id)
      return res.status(200).json({
        data: meeting,
      })
    } catch (error: any) {
      if (error.message === errors.VALIDATION.MEETING_NOT_FOUND.message) {
        return next(new HttpError(404, errors.VALIDATION.MEETING_NOT_FOUND))
      }
      if (error.message === errors.AUTH.UNAUTHORIZED.message) {
        return next(new HttpError(403, errors.AUTH.UNAUTHORIZED))
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getAllMeetings(
    req: AuthRequest<never, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user
      const meetings = await meetingService.getAllMeetings(user!.id)
      return res.status(200).json({
        data: meetings,
      })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async deleteMeeting(
    req: AuthRequest<{ id: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user
      const deletedMeeting = await meetingService.deleteMeeting(
        req.params.id,
        user!.id,
      )
      res.status(200).json({ data: deletedMeeting })
    } catch (error: any) {
      if (error.message === errors.VALIDATION.MEETING_NOT_FOUND.message) {
        return next(new HttpError(404, errors.VALIDATION.MEETING_NOT_FOUND))
      }
      if (error.message === errors.AUTH.UNAUTHORIZED.message) {
        return next(new HttpError(403, errors.AUTH.UNAUTHORIZED))
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async updateMeetingByStudent(
    req: AuthRequest<{ id: string }, never, Partial<TscheduleMeetingSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user
      const { id } = req.params
      const updatedMeeting = await meetingService.updateMeetingByStudent(
        id,
        user!.id,
        req.body,
      )
      res.status(200).json({ data: updatedMeeting })
    } catch (error: any) {
      if (error.message === errors.VALIDATION.MEETING_NOT_FOUND.message) {
        return next(new HttpError(404, errors.VALIDATION.MEETING_NOT_FOUND))
      }
      if (error.message === errors.AUTH.UNAUTHORIZED.message) {
        return next(new HttpError(403, errors.AUTH.UNAUTHORIZED))
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async validateMeetingBySupervisor(
    req: AuthRequest<{ id: string }, never, never>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params
      const user = req.user
      const validatedMeeting = await meetingService.validateMeetingBySupervisor(
        id,
        user!.id,
      )
      res.status(200).json({ data: validatedMeeting })
    } catch (error: any) {
      if (error.message === errors.VALIDATION.MEETING_NOT_FOUND.message) {
        return next(new HttpError(404, errors.VALIDATION.MEETING_NOT_FOUND))
      }
      if (error.message === errors.AUTH.UNAUTHORIZED.message) {
        return next(new HttpError(403, errors.AUTH.UNAUTHORIZED))
      }
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }
}

export default new MeetingController()
