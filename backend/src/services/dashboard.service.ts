import { Types } from "mongoose"
import { Project } from "../models/project"
import { Sprint } from "../models/sprint"
import { Task } from "../models/task"
import { TaskHistory } from "../models/taskHistory"
import { Meeting } from "../models/meeting"
import { ReportVersion } from "../models/reportVersion"
import { Validation } from "../models/validation"
import { TaskStatus, MeetingStatus, SprintStatus } from "../models/enums"

class DashboardService {
  async getUserProjects(userId: string) {
    const projects = await Project.find({
      $or: [
        { student: userId },
        { companySupervisor: userId },
        { academicSupervisor: userId },
      ],
    })
      .populate("student", "firstName lastName email")
      .populate("companySupervisor", "firstName lastName email")
      .populate("academicSupervisor", "firstName lastName email")
      .lean()

    return projects
  }

  async getProjectBasicInfo(userId: string) {
    const projects = await Project.find({
      $or: [
        { student: userId },
        { companySupervisor: userId },
        { academicSupervisor: userId },
      ],
    }).select("_id title")

    return projects
  }

  async getTimelineData(projectIds: Types.ObjectId[]) {
    const [meetings, taskHistories, validations, reportVersions] =
      await Promise.all([
        Meeting.find({
          projectId: { $in: projectIds },
        })
          .sort({ plannedDate: -1 })
          .populate("plannedBy", "firstName lastName email")
          .lean(),

        TaskHistory.aggregate([
          {
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task",
            },
          },
          { $unwind: "$task" },
          {
            $lookup: {
              from: "userstories",
              localField: "task.userStoryId",
              foreignField: "_id",
              as: "userStory",
            },
          },
          { $unwind: "$userStory" },
          {
            $lookup: {
              from: "sprints",
              localField: "userStory.sprintId",
              foreignField: "_id",
              as: "sprint",
            },
          },
          { $unwind: "$sprint" },
          {
            $match: {
              "sprint.projectId": { $in: projectIds },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "changedBy",
              foreignField: "_id",
              as: "changedByUser",
            },
          },
          { $unwind: "$changedByUser" },
          {
            $project: {
              _id: 1,
              type: "TASK_STATUS_CHANGE",
              date: "$createdAt",
              taskTitle: "$task.title",
              fromStatus: 1,
              toStatus: 1,
              changedBy: {
                _id: "$changedByUser._id",
                firstName: "$changedByUser.firstName",
                lastName: "$changedByUser.lastName",
              },
              projectId: "$sprint.projectId",
            },
          },
          { $sort: { date: -1 } },
        ]),

        Validation.aggregate([
          {
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task",
            },
          },
          { $unwind: "$task" },
          {
            $lookup: {
              from: "userstories",
              localField: "task.userStoryId",
              foreignField: "_id",
              as: "userStory",
            },
          },
          { $unwind: "$userStory" },
          {
            $lookup: {
              from: "sprints",
              localField: "userStory.sprintId",
              foreignField: "_id",
              as: "sprint",
            },
          },
          { $unwind: "$sprint" },
          {
            $match: {
              "sprint.projectId": { $in: projectIds },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "validatorId",
              foreignField: "_id",
              as: "validator",
            },
          },
          { $unwind: "$validator" },
          {
            $project: {
              _id: 1,
              type: "VALIDATION",
              date: "$createdAt",
              taskTitle: "$task.title",
              isValidated: 1,
              validator: {
                _id: "$validator._id",
                firstName: "$validator.firstName",
                lastName: "$validator.lastName",
                role: "$validator.role",
              },
              projectId: "$sprint.projectId",
            },
          },
          { $sort: { date: -1 } },
        ]),

        ReportVersion.find({
          projectId: { $in: projectIds },
        })
          .sort({ createdAt: -1 })
          .populate("uploadedBy", "firstName lastName")
          .lean(),
      ])

    return { meetings, taskHistories, validations, reportVersions }
  }

  async getTasksStatistics(projectIds: Types.ObjectId[]) {
    const tasksStats = await Task.aggregate([
      {
        $lookup: {
          from: "userstories",
          localField: "userStoryId",
          foreignField: "_id",
          as: "userStory",
        },
      },
      { $unwind: "$userStory" },
      {
        $lookup: {
          from: "sprints",
          localField: "userStory.sprintId",
          foreignField: "_id",
          as: "sprint",
        },
      },
      { $unwind: "$sprint" },
      {
        $match: {
          "sprint.projectId": { $in: projectIds },
        },
      },
      {
        $group: {
          _id: "$sprint.projectId",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.DONE] }, 1, 0] },
          },
          tasksInProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0],
            },
          },
          tasksBlocked: {
            $sum: {
              $cond: [{ $eq: ["$status", TaskStatus.STANDBY] }, 1, 0],
            },
          },
          tasksTodo: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.TO_DO] }, 1, 0] },
          },
        },
      },
    ])

    return tasksStats
  }

  async getSprintsByProjectIds(projectIds: Types.ObjectId[]) {
    const sprints = await Sprint.find({
      projectId: { $in: projectIds },
    })
      .sort({ order: 1 })
      .lean()

    return sprints
  }

  async getUpcomingMeetings(projectIds: Types.ObjectId[]) {
    const meetings = await Meeting.find({
      projectId: { $in: projectIds },
      plannedDate: { $gte: new Date() },
      status: MeetingStatus.PLANNED,
    })
      .sort({ plannedDate: 1 })
      .limit(5)
      .populate("plannedBy", "firstName lastName")
      .lean()

    return meetings
  }

  async getPendingValidationsCount(projectIds: Types.ObjectId[]) {
    const result = await Validation.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "taskId",
          foreignField: "_id",
          as: "task",
        },
      },
      { $unwind: "$task" },
      {
        $lookup: {
          from: "userstories",
          localField: "task.userStoryId",
          foreignField: "_id",
          as: "userStory",
        },
      },
      { $unwind: "$userStory" },
      {
        $lookup: {
          from: "sprints",
          localField: "userStory.sprintId",
          foreignField: "_id",
          as: "sprint",
        },
      },
      { $unwind: "$sprint" },
      {
        $match: {
          "sprint.projectId": { $in: projectIds },
          isValidated: false,
        },
      },
      { $count: "count" },
    ])

    return result[0]?.count || 0
  }

  async getRecentReportVersions(projectIds: Types.ObjectId[]) {
    const reportVersions = await ReportVersion.find({
      projectId: { $in: projectIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("uploadedBy", "firstName lastName")
      .populate("projectId", "title")
      .lean()

    return reportVersions
  }

  async getProjectDetails(projectId: string) {
    const [sprints, userStories, tasks, meetings, validations, reportVersions] =
      await Promise.all([
        Sprint.find({ projectId }).sort({ order: 1 }).lean(),

        Task.aggregate([
          {
            $lookup: {
              from: "userstories",
              localField: "userStoryId",
              foreignField: "_id",
              as: "userStory",
            },
          },
          { $unwind: "$userStory" },
          {
            $lookup: {
              from: "sprints",
              localField: "userStory.sprintId",
              foreignField: "_id",
              as: "sprint",
            },
          },
          { $unwind: "$sprint" },
          {
            $match: { "sprint.projectId": new Types.ObjectId(projectId) },
          },
          {
            $group: {
              _id: "$userStoryId",
              userStoryTitle: { $first: "$userStory.title" },
              sprintId: { $first: "$userStory.sprintId" },
              sprintTitle: { $first: "$sprint.title" },
              totalTasks: { $sum: 1 },
              completedTasks: {
                $sum: { $cond: [{ $eq: ["$status", TaskStatus.DONE] }, 1, 0] },
              },
              tasksInProgress: {
                $sum: {
                  $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0],
                },
              },
              tasksBlocked: {
                $sum: {
                  $cond: [{ $eq: ["$status", TaskStatus.STANDBY] }, 1, 0],
                },
              },
            },
          },
          { $sort: { sprintTitle: 1, userStoryTitle: 1 } },
        ]),

        Task.aggregate([
          {
            $lookup: {
              from: "userstories",
              localField: "userStoryId",
              foreignField: "_id",
              as: "userStory",
            },
          },
          { $unwind: "$userStory" },
          {
            $lookup: {
              from: "sprints",
              localField: "userStory.sprintId",
              foreignField: "_id",
              as: "sprint",
            },
          },
          { $unwind: "$sprint" },
          {
            $match: { "sprint.projectId": new Types.ObjectId(projectId) },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              tasks: {
                $push: {
                  _id: "$_id",
                  title: "$title",
                  userStoryId: "$userStoryId",
                  sprintId: "$sprint._id",
                },
              },
            },
          },
        ]),

        Meeting.find({ projectId })
          .sort({ plannedDate: -1 })
          .limit(10)
          .populate("plannedBy", "firstName lastName")
          .lean(),

        Validation.aggregate([
          {
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task",
            },
          },
          { $unwind: "$task" },
          {
            $lookup: {
              from: "userstories",
              localField: "task.userStoryId",
              foreignField: "_id",
              as: "userStory",
            },
          },
          { $unwind: "$userStory" },
          {
            $lookup: {
              from: "sprints",
              localField: "userStory.sprintId",
              foreignField: "_id",
              as: "sprint",
            },
          },
          { $unwind: "$sprint" },
          {
            $match: { "sprint.projectId": new Types.ObjectId(projectId) },
          },
          {
            $lookup: {
              from: "users",
              localField: "validatorId",
              foreignField: "_id",
              as: "validator",
            },
          },
          { $unwind: "$validator" },
          {
            $group: {
              _id: "$isValidated",
              count: { $sum: 1 },
              validations: {
                $push: {
                  _id: "$_id",
                  taskId: "$taskId",
                  taskTitle: "$task.title",
                  validator: {
                    _id: "$validator._id",
                    firstName: "$validator.firstName",
                    lastName: "$validator.lastName",
                    role: "$validator.role",
                  },
                  createdAt: "$createdAt",
                  meetingId: "$meetingId",
                },
              },
            },
          },
        ]),

        ReportVersion.find({ projectId })
          .sort({ createdAt: -1 })
          .populate("uploadedBy", "firstName lastName")
          .lean(),
      ])

    return {
      sprints,
      userStories,
      tasks,
      meetings,
      validations,
      reportVersions,
    }
  }

  async isUserAuthorizedForProject(userId: string, projectId: string) {
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { student: userId },
        { companySupervisor: userId },
        { academicSupervisor: userId },
      ],
    })

    return !!project
  }
  
  async getProjectById(projectId: string) {
    const project = await Project.findById(projectId)
      .populate("student", "firstName lastName email")
      .populate("companySupervisor", "firstName lastName email")
      .populate("academicSupervisor", "firstName lastName email")
      .lean()
    return project
  }
  async getSprintsStatistics(projectIds: Types.ObjectId[]) {
    const sprintsStats = await Sprint.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
        },
      },
      {
        $lookup: {
          from: "userstories",
          localField: "_id",
          foreignField: "sprintId",
          as: "userStories",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "userStories._id",
          foreignField: "userStoryId",
          as: "tasks",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          order: 1,
          status: 1,
          projectId: 1,
          startDate: 1,
          endDate: 1,
          createdAt: 1,
          totalUserStories: { $size: "$userStories" },
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", TaskStatus.DONE] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          completionPercentage: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { order: 1 } },
    ])

    return sprintsStats
  }

  async getSprintDetails(sprintId: string) {
    const [sprint, userStoriesStats, tasksByStatus] = await Promise.all([
      Sprint.findById(sprintId).lean(),
      Task.aggregate([
        {
          $lookup: {
            from: "userstories",
            localField: "userStoryId",
            foreignField: "_id",
            as: "userStory",
          },
        },
        { $unwind: "$userStory" },
        {
          $match: { "userStory.sprintId": new Types.ObjectId(sprintId) },
        },
        {
          $group: {
            _id: "$userStoryId",
            userStoryTitle: { $first: "$userStory.title" },
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ["$status", TaskStatus.DONE] }, 1, 0] },
            },
            tasksInProgress: {
              $sum: {
                $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0],
              },
            },
            tasksBlocked: {
              $sum: {
                $cond: [{ $eq: ["$status", TaskStatus.STANDBY] }, 1, 0],
              },
            },
          },
        },
        { $sort: { userStoryTitle: 1 } },
      ]),
      Task.aggregate([
        {
          $lookup: {
            from: "userstories",
            localField: "userStoryId",
            foreignField: "_id",
            as: "userStory",
          },
        },
        { $unwind: "$userStory" },
        {
          $match: { "userStory.sprintId": new Types.ObjectId(sprintId) },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    return {
      sprint,
      userStories: userStoriesStats,
      tasksByStatus: tasksByStatus.map(item => ({
        status: item._id,
        count: item.count,
      })),
    }
  }

  async getProjectsSummary(userId: string) {
    const projects = await this.getUserProjects(userId)
    const projectIds = projects.map(p => p._id)

    const [
      sprints,
      tasksStats,
      pendingValidations,
      upcomingMeetings,
      recentReportVersions
    ] = await Promise.all([
      this.getSprintsByProjectIds(projectIds),
      this.getTasksStatistics(projectIds),
      this.getPendingValidationsCount(projectIds),
      this.getUpcomingMeetings(projectIds),
      this.getRecentReportVersions(projectIds)
    ])

    const totalTasks = tasksStats.reduce((acc, curr) => acc + curr.totalTasks, 0)
    const completedTasks = tasksStats.reduce((acc, curr) => acc + curr.completedTasks, 0)
    const activeSprints = sprints.filter(s => s.status === SprintStatus.IN_PROGRESS).length

    return {
      totalProjects: projects.length,
      activeSprints,
      totalTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      pendingValidations,
      upcomingMeetings: upcomingMeetings.length,
      recentReports: recentReportVersions.length
    }
  }

  async getActiveProjects(userId: string) {
    const projects = await this.getUserProjects(userId)
    const projectIds = projects.map(p => p._id)

    const [sprints, tasksStats] = await Promise.all([
      this.getSprintsByProjectIds(projectIds),
      this.getTasksStatistics(projectIds),
    ])

    const activeProjects = projects.filter(project => {
      const projectSprints = sprints.filter(
        s => s.projectId.toString() === project._id.toString()
      )
      return projectSprints.some(s => s.status === SprintStatus.IN_PROGRESS)
    }).map(project => {
      const projectSprints = sprints.filter(
        s => s.projectId.toString() === project._id.toString()
      )
      const projectTasks = tasksStats.find(
        t => t._id.toString() === project._id.toString()
      ) || { totalTasks: 0, completedTasks: 0 }

      return {
        ...project,
        activeSprints: projectSprints.filter(s => s.status === SprintStatus.IN_PROGRESS).length,
        totalSprints: projectSprints.length,
        completionRate: projectTasks.totalTasks > 0 
          ? Math.round((projectTasks.completedTasks / projectTasks.totalTasks) * 100)
          : 0,
      }
    })

    return {
      activeProjects,
      totalActiveProjects: activeProjects.length,
    }
  }
}

export default new DashboardService()