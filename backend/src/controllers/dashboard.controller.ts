import { NextFunction, Response } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"

import {
  BasicProjectInfo,
  DashboardOverview,
  TimelineEvent,
  ProjectDetailsResponse,
  TasksStatistics,
  SprintStats,
  PopulatedProject,
  ProjectMember,
} from "../types/dashboard.types"

import dashboardService from "../services/dashboard.service"
import {
  TprojectStatsParamsSchema,
  TsprintDetailsParamsSchema,
} from "../schemas/dashboard.schema"
import { Sprint } from "../models/sprint"
import {
  calculatePercentage,
  normalizeMember,
} from "../util/helpers/dashboard.helper"

class DashboardController {
  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const projects: BasicProjectInfo[] =
        await dashboardService.getProjectBasicInfo(userId)
      if (!projects.length) {
        return res.json({ data: { timeline: [], projects: [] } })
      }

      const projectIds = projects.map((p) => p._id)
      const { meetings, taskHistories, validations, reportVersions } =
        await dashboardService.getTimelineData(projectIds)

      const meetingEvents: TimelineEvent[] = meetings.map((m) => ({
        _id: m._id,
        type: "MEETING",
        date: m.plannedDate ?? m.createdAt,
        title: m.title,
        status: m.status,
        plannedBy: m.plannedBy,
        validatedAt: m.validatedAt ?? null,
        projectId: m.projectId ?? null,
      }))

      const reportEvents: TimelineEvent[] = reportVersions.map((r) => ({
        _id: r._id,
        type: "REPORT_UPLOAD",
        date: r.createdAt,
        versionNumber: r.versionNumber,
        uploadedBy: r.uploadedBy ?? null,
        notes: r.notes ?? undefined,
        projectId: r.projectId ?? null,
      }))

      const allEvents: TimelineEvent[] = [
        ...meetingEvents,
        ...(taskHistories as TimelineEvent[]),
        ...(validations as TimelineEvent[]),
        ...reportEvents,
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      res.json({ data: { timeline: allEvents, projects } })
    } catch (error) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id

      const projects = await dashboardService.getUserProjects(userId)
      if (!projects.length) {
        return res.json({
          data: {
            projects: [],
            overallStats: {
              totalProjects: 0,
              totalSprints: 0,
              totalTasks: 0,
              completedTasks: 0,
              tasksInProgress: 0,
              tasksBlocked: 0,
              tasksTodo: 0,
              completionPercentage: 0,
              pendingValidations: 0,
              upcomingMeetings: 0,
              recentReportVersions: 0,
            },
          },
        })
      }

      const projectIds = projects.map((p) => p._id)
      const [
        tasksStats,
        sprints,
        meetings,
        pendingValidations,
        recentReportVersions,
      ] = await Promise.all([
        dashboardService.getTasksStatistics(projectIds),
        dashboardService.getSprintsByProjectIds(projectIds),
        dashboardService.getUpcomingMeetings(projectIds),
        dashboardService.getPendingValidationsCount(projectIds),
        dashboardService.getRecentReportVersions(projectIds),
      ])

      const tasksAggregate = tasksStats.reduce(
        (acc, curr) => ({
          totalTasks: acc.totalTasks + curr.totalTasks,
          completedTasks: acc.completedTasks + curr.completedTasks,
          tasksInProgress: acc.tasksInProgress + curr.tasksInProgress,
          tasksBlocked: acc.tasksBlocked + curr.tasksBlocked,
          tasksTodo: acc.tasksTodo + curr.tasksTodo,
        }),
        {
          totalTasks: 0,
          completedTasks: 0,
          tasksInProgress: 0,
          tasksBlocked: 0,
          tasksTodo: 0,
        },
      )

      const overallStats: DashboardOverview["overallStats"] = {
        totalProjects: projects.length,
        totalSprints: sprints.length,
        ...tasksAggregate,
        completionPercentage: calculatePercentage(
          tasksAggregate.completedTasks,
          tasksAggregate.totalTasks,
        ),
        pendingValidations,
        upcomingMeetings: meetings.length,
        recentReportVersions: recentReportVersions.length,
      }

      const projectsWithStats: DashboardOverview["projects"] = projects.map(
        (project) => {
          const student = project.student
            ? normalizeMember(project.student)
            : null
          const companySupervisor = project.companySupervisor
            ? normalizeMember(project.companySupervisor)
            : null
          const academicSupervisor = project.academicSupervisor
            ? normalizeMember(project.academicSupervisor)
            : null

          const projectTasks = tasksStats.find(
            (t) =>
              t._id &&
              project._id &&
              t._id.toString() === project._id.toString(),
          ) ?? {
            totalTasks: 0,
            completedTasks: 0,
            tasksInProgress: 0,
            tasksBlocked: 0,
            tasksTodo: 0,
          }

          const projectSprints = sprints.filter(
            (s) =>
              s.projectId &&
              project._id &&
              s.projectId.toString() === project._id.toString(),
          )

          const upcomingMeetingsCount = meetings.filter(
            (m) =>
              m.projectId &&
              project._id &&
              m.projectId.toString() === project._id.toString(),
          ).length

          const recentReportsCount = recentReportVersions.filter(
            (r) =>
              r.projectId &&
              project._id &&
              r.projectId.toString() === project._id.toString(),
          ).length

          return {
            ...project,
            student,
            companySupervisor,
            academicSupervisor,
            stats: {
              ...projectTasks,
              completionPercentage: calculatePercentage(
                projectTasks.completedTasks,
                projectTasks.totalTasks,
              ),
              totalSprints: projectSprints.length,
              upcomingMeetings: upcomingMeetingsCount,
              recentReports: recentReportsCount,
            },
            activeSprints: projectSprints.filter(
              (s) => s.status === "IN_PROGRESS",
            ).length,
          } as PopulatedProject & {
            stats: typeof projectTasks
            activeSprints: number
          }
        },
      )

      res.json({
        data: {
          projects: projectsWithStats,
          overallStats,
          upcomingMeetings: meetings,
          recentReportVersions,
        },
      })
    } catch (error) {
      console.error(error)
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getProjectStats(
    req: AuthRequest<TprojectStatsParamsSchema>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id
      const { projectId } = req.params

      const isAuthorized = await dashboardService.isUserAuthorizedForProject(
        userId,
        projectId,
      )
      if (!isAuthorized)
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_USER))

      const project = await dashboardService.getProjectById(projectId)
      if (!project) return next(new HttpError(404, errors.PROJECT.NO_PROJECT))

      const normalizedProject: PopulatedProject = {
        ...project,
        _id: project._id!,
        student: normalizeMember(project.student),
        companySupervisor: normalizeMember(project.companySupervisor),
        academicSupervisor: normalizeMember(project.academicSupervisor),
      }

      const {
        sprints,
        userStories,
        tasks,
        meetings,
        validations,
        reportVersions,
      } = await dashboardService.getProjectDetails(projectId)

      const validationsSummary = validations.reduce(
        (acc, curr) => ({
          validated: acc.validated + (curr._id === true ? curr.count : 0),
          pending: acc.pending + (curr._id === false ? curr.count : 0),
        }),
        { validated: 0, pending: 0 },
      )

      const sprintStats: SprintStats[] = sprints.map((sprint) => {
        const sprintTasks = tasks
          .flatMap((t) => t.tasks)
          .filter((task) => task.sprintId?.toString() === sprint._id.toString())

        const sprintUserStories = userStories.filter((us) =>
          us.sprintId.equals(sprint._id),
        )

        return {
          ...sprint,
          totalUserStories: sprintUserStories.length,
          totalTasks: sprintTasks.length,
          completedTasks: sprintTasks.filter((t) => t.status === "DONE").length,
          completionPercentage: calculatePercentage(
            sprintTasks.filter((t) => t.status === "DONE").length,
            sprintTasks.length,
          ),
        }
      })

      const response: ProjectDetailsResponse = {
        project: normalizedProject,
        stats: {
          totalSprints: sprints.length,
          totalUserStories: userStories.length,
          totalTasks: tasks.reduce((acc, curr) => acc + curr.count, 0),
          tasksByStatus: tasks,
          validationsSummary,
          totalMeetings: meetings.length,
          totalReportVersions: reportVersions.length,
        },
        sprints: sprintStats,
        userStories,
        recentMeetings: meetings,
        recentReportVersions: reportVersions.slice(0, 5),
        validations,
      }

      res.json({ data: response })
    } catch (error) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getSprintDetails(
    req: AuthRequest<TsprintDetailsParamsSchema>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { sprintId } = req.params
      const userId = req.user!.id

      const sprint = await Sprint.findById(sprintId)
      if (!sprint) return next(new HttpError(404, errors.SPRINT.NOT_FOUND))

      const isAuthorized = await dashboardService.isUserAuthorizedForProject(
        userId,
        sprint.projectId.toString(),
      )
      if (!isAuthorized)
        return next(new HttpError(403, errors.AUTH.FORBIDDEN_USER))

      const sprintDetails = await dashboardService.getSprintDetails(sprintId)
      res.json({ data: sprintDetails })
    } catch (error) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getSprintsStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const projects = await dashboardService.getProjectBasicInfo(userId)
      if (!projects.length)
        return res.json({ data: { sprintsStats: [], projects: [] } })

      const projectIds = projects.map((p) => p._id)
      const sprintsStats = await dashboardService.getSprintsStatistics(
        projectIds,
      )

      res.json({ data: { sprintsStats, projects } })
    } catch (error) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getProjectsSummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id
      const summary = await dashboardService.getProjectsSummary(userId)
      res.json({ data: summary })
    } catch (error) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }

  async getActiveProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const activeProjects = await dashboardService.getActiveProjects(userId)
      res.json({ data: activeProjects })
    } catch (error) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR))
    }
  }
}

export default new DashboardController()
