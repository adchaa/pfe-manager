import { Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import { Sprint } from "../models/sprint"
import { Project } from "../models/project"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import {
  TcreateSprintSchema,
  TupdateSprintSchema,
} from "../schemas/sprint.schema"
import sprintService from "../services/sprint.service"
import { UserRole, SprintStatus } from "../models/enums"

export const sprintController = {
  createSprint: async (
    req: AuthRequest<never, never, TcreateSprintSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const { title, startDate, endDate, order, projectId } = req.body
      console.log(req.body)
      const project = await Project.findById(projectId)
      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      if (project.student?.toString() !== req.user.id) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        return next(new HttpError(400, errors.SPRINT.INVALID_END_DATE))
      }

      const existingSprintWithOrder = await Sprint.findOne({
        projectId,
        order,
      })
      if (existingSprintWithOrder) {
        return next(new HttpError(400, errors.SPRINT.ORDER_EXISTS))
      }

      const sprint = new Sprint({
        title,
        startDate: start,
        endDate: end,
        order,
        projectId,
        status: SprintStatus.PLANNED,
      })

      await sprint.save()

      const populatedSprint = await Sprint.findById(sprint._id).populate(
        "projectId",
        "title description",
      )

      res.status(201).json({
        data: populatedSprint,
      })
    } catch (error) {
      next(error)
    }
  },

  getSprintsByProject: async (
    req: AuthRequest<{ projectId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const { projectId } = req.params
      const project = await Project.findById(projectId)
      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      const userId = req.user.id
      const isAuthorized =
        (project.student && project.student.toString() === userId) ||
        (project.academicSupervisor &&
          project.academicSupervisor.toString() === userId) ||
        (project.companySupervisor &&
          project.companySupervisor.toString() === userId)

      if (!isAuthorized) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      const sprints = await Sprint.find({ projectId })
        .populate("projectId", "title description")
        .sort({ order: 1 })

      res.json({
        data: sprints,
      })
    } catch (error) {
      next(error)
    }
  },

  getSprintById: async (
    req: AuthRequest<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const sprint = await Sprint.findById(req.params.id).populate(
        "projectId",
        "title description student academicSupervisor companySupervisor",
      )

      if (!sprint) {
        return next(new HttpError(404, errors.SPRINT.SPRINT_NOTFOUND))
      }

      const isAuthorized = await sprintService.isAuthorizedForSprint(
        req.user.id,
        req.params.id,
      )

      if (!isAuthorized) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      res.json({
        data: sprint,
      })
    } catch (error) {
      next(error)
    }
  },

  updateSprint: async (
    req: AuthRequest<{ id: string }, never, TupdateSprintSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const sprint = await Sprint.findById(req.params.id)
      if (!sprint) {
        return next(new HttpError(404, errors.SPRINT.SPRINT_NOTFOUND))
      }

      const project = await Project.findById(sprint.projectId)
      if (!project || project.student?.toString() !== req.user.id) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      const { title, startDate, endDate, order, status } = req.body
      const updateData: {
        title?: string
        startDate?: Date
        endDate?: Date
        order?: number
        status?: SprintStatus
      } = {}

      if (title !== undefined) updateData.title = title
      if (startDate !== undefined) updateData.startDate = new Date(startDate)
      if (endDate !== undefined) updateData.endDate = new Date(endDate)
      if (order !== undefined) updateData.order = order
      if (status !== undefined) updateData.status = status

      if (updateData.startDate && updateData.endDate) {
        if (updateData.startDate >= updateData.endDate) {
          return next(new HttpError(400, errors.SPRINT.INVALID_END_DATE))
        }
      }

      if (order !== undefined && order !== sprint.order) {
        const existingSprintWithOrder = await Sprint.findOne({
          projectId: sprint.projectId,
          order,
          _id: { $ne: sprint._id },
        })
        if (existingSprintWithOrder) {
          return next(new HttpError(400, errors.SPRINT.ORDER_EXISTS))
        }
      }

      const updatedSprint = await Sprint.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).populate("projectId", "title description")

      res.json({
        data: updatedSprint,
      })
    } catch (error) {
      next(error)
    }
  },

  deleteSprint: async (
    req: AuthRequest<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const sprint = await Sprint.findById(req.params.id)
      if (!sprint) {
        return next(new HttpError(404, errors.SPRINT.SPRINT_NOTFOUND))
      }

      const project = await Project.findById(sprint.projectId)
      if (!project || project.student?.toString() !== req.user.id) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      await Sprint.findByIdAndDelete(req.params.id)

      res.json({
        success: true,
        message: "Sprint deleted with success",
      })
    } catch (error) {
      next(error)
    }
  },
}
