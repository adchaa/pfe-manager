import e, { Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import { Project } from "../models/project"
import { User } from "../models/user"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import {
  TcreateProjectSchema,
  TupdateProjectSchema,
} from "../schemas/project.schema"
import { ProjectState } from "../models/enums" 

export const projectController = {
  createProject: async (
    req: AuthRequest<never, never, TcreateProjectSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const existingProject = await Project.findOne({ 
        student: req.user.id,
        state: ProjectState.ACTIVE 
      })
      if (existingProject) {
        return next(new HttpError(400, errors.PROJECT.PROJECT_EXISTS))
      }

      const {
        title,
        description,
        academicSupervisor,
        companySupervisor,
        startDate,
        endDate,
      } = req.body

      const academicSupervisorUser = await User.findById(academicSupervisor)
      if (
        !academicSupervisorUser ||
        academicSupervisorUser.role !== "ENCADRANT_UNIVERSITAIRE"
      ) {
        return next(
          new HttpError(400, errors.PROJECT.ACADEMIC_SUPERVISOR_INVALID),
        )
      }

      const companySupervisorUser = await User.findById(companySupervisor)
      if (
        !companySupervisorUser ||
        companySupervisorUser.role !== "ENCADRANT_ENTREPRISE"
      ) {
        return next(
          new HttpError(400, errors.PROJECT.COMPANY_SUPERVISOR_INVALID),
        )
      }

      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        return next(new HttpError(400, errors.PROJECT.START_DATE_INVALID))
      }

      const project = new Project({
        title,
        description,
        academicSupervisor,
        companySupervisor,
        student: req.user.id,
        startDate: start,
        endDate: end,
      })

      await project.save()

      const populatedProject = await Project.findById(project._id)
        .populate("academicSupervisor", "firstName lastName email role")
        .populate("companySupervisor", "firstName lastName email role")
        .populate("student", "firstName lastName email role")

      res.status(201).json({
        data: populatedProject,
      })
    } catch (error) {
      next(error)
    }
  },

  getAllProjects: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      let projects

      if (req.user.role === "ENCADRANT_UNIVERSITAIRE") {
        projects = await Project.find({ academicSupervisor: req.user.id })
      } else if (req.user.role === "ENCADRANT_ENTREPRISE") {
        projects = await Project.find({ companySupervisor: req.user.id })
      } else if (req.user.role === "ETUDIANT") {
        projects = await Project.find({ student: req.user.id })
      } else {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      const populatedProjects = await Project.populate(projects, [
        { path: "academicSupervisor", select: "firstName lastName email role" },
        { path: "companySupervisor", select: "firstName lastName email role" },
        { path: "student", select: "firstName lastName email role" },
      ])

      res.json({
        data: populatedProjects,
      })
    } catch (error) {
      next(error)
    }
  },

  getMyProject: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      let project

      if (req.user.role === "ETUDIANT") {
        project = await Project.findOne({ student: req.user.id })
      } else if (req.user.role === "ENCADRANT_UNIVERSITAIRE") {
        project = await Project.findOne({ academicSupervisor: req.user.id })
      } else if (req.user.role === "ENCADRANT_ENTREPRISE") {
        project = await Project.findOne({ companySupervisor: req.user.id })
      }

      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      const populatedProject = await Project.findById(project._id)
        .populate("academicSupervisor", "firstName lastName email role")
        .populate("companySupervisor", "firstName lastName email role")
        .populate("student", "firstName lastName email role")

      res.json({
        data: populatedProject,
      })
    } catch (error) {
      next(error)
    }
  },

  getProjectById: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const project = await Project.findById(req.params.id)
        .populate("academicSupervisor", "firstName lastName email role")
        .populate("companySupervisor", "firstName lastName email role")
        .populate("student", "firstName lastName email role")

      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      const userId = req.user.id

      if (req.user.role === "ETUDIANT") {
        if (!project.student || project.student._id.toString() !== userId) {
          return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
        }
      } else if (req.user.role === "ENCADRANT_UNIVERSITAIRE") {
        if (
          !project.academicSupervisor ||
          project.academicSupervisor._id.toString() !== userId
        ) {
          return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
        }
      } else if (req.user.role === "ENCADRANT_ENTREPRISE") {
        if (
          !project.companySupervisor ||
          project.companySupervisor._id.toString() !== userId
        ) {
          return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
        }
      }

      res.json({
        data: project,
      })
    } catch (error) {
      next(error)
    }
  },
  updateProject: async (
    req: AuthRequest<{ id: string }, never, TupdateProjectSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const project = await Project.findById(req.params.id)
      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      if (project.student?.toString() !== req.user.id) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      const { title, description, startDate, endDate, state } = req.body
      const updateData: {
        title?: string
        description?: string
        startDate?: string
        endDate?: string
        state?: string
      } = {}

      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (startDate !== undefined) updateData.startDate = startDate
      if (endDate !== undefined) updateData.endDate = endDate
      if (state !== undefined) updateData.state = state


      if (state === ProjectState.ACTIVE && project.state === ProjectState.ARCHIVED) {
        
        const existingActiveProject = await Project.findOne({
          student: req.user.id,
          state: ProjectState.ACTIVE,
          _id: { $ne: project._id } 
        })

        if (existingActiveProject) {
          return next(new HttpError(400, errors.PROJECT.CANNOT_REACTIVATE))
        }
      }

      if (updateData.startDate && updateData.endDate) {
        const start = new Date(updateData.startDate)
        const end = new Date(updateData.endDate)
        if (start >= end) {
          return next(new HttpError(400, errors.PROJECT.START_DATE_INVALID))
        }
      }

      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      )
        .populate("academicSupervisor", "firstName lastName email role")
        .populate("companySupervisor", "firstName lastName email role")
        .populate("student", "firstName lastName email role")

      res.json({
        data: updatedProject,
      })
    } catch (error) {
      next(error)
    }
  },

  deleteProject: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const project = await Project.findById(req.params.id)
      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      if (!project.student || project.student.toString() !== req.user.id) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      await Project.findByIdAndDelete(req.params.id)

      res.json({
        success: true,
        message: "Projet supprimé avec succès",
      })
    } catch (error) {
      next(error)
    }
  },

  archiveProject: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
      }

      const project = await Project.findById(req.params.id)
      if (!project) {
        return next(new HttpError(404, errors.PROJECT.NO_PROJECT))
      }

      if (!project.student || project.student.toString() !== req.user.id) {
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
      }

      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        { state: "ARCHIVED" },
        { new: true },
      )
        .populate("academicSupervisor", "firstName lastName email role")
        .populate("companySupervisor", "firstName lastName email role")
        .populate("student", "firstName lastName email role")

      res.json({
        success: true,
        data: updatedProject,
        message: "Projet archivé avec succès",
      })
    } catch (error) {
      next(error)
    }
  },
}
