import { Types } from "mongoose"
import { Project } from "../models/project"
import { Sprint } from "../models/sprint"
import { UserStory } from "../models/userStory"
import { Meeting } from "../models/meeting"
import { Task } from "../models/task"
import { TaskHistory } from "../models/taskHistory"
import { Validation } from "../models/validation"
import { ReportVersion } from "../models/reportVersion"
import { TaskStatus, MeetingStatus, ValidationStatus, TimelineEventType } from "../models/enums"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"

// Interfaces pour les types étendus
interface TaskWithValidations extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  userStoryId: Types.ObjectId;
  estimatedHours?: number;
  status: TaskStatus;
  assignedId?: any;
  validations?: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserStoryWithTasks extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  priority?: number;
  sprintId: Types.ObjectId;
  tasks?: TaskWithValidations[];
  createdAt: Date;
  updatedAt: Date;
}

class HtmlReportService {
  async isAuthorizedForProject(userId: string, projectId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, errors.AUTH.INVALID_USER)
    }

    if (!Types.ObjectId.isValid(projectId)) {
      throw new HttpError(400, errors.PROJECT.NO_PROJECT)
    }

    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      $or: [
        { student: new Types.ObjectId(userId) },
        { companySupervisor: new Types.ObjectId(userId) },
        { academicSupervisor: new Types.ObjectId(userId) },
      ],
    })

    return project
  }

  async generateSprintReport(
    userId: string,
    projectId: string,
    sprintId: string,
  ) {
    // Validation des entrées
    if (!Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, errors.AUTH.INVALID_USER)
    }

    if (!Types.ObjectId.isValid(projectId)) {
      throw new HttpError(400, errors.PROJECT.NO_PROJECT)
    }

    if (!Types.ObjectId.isValid(sprintId)) {
      throw new HttpError(400, errors.SPRINT.NOT_FOUND)
    }

    // Vérification des autorisations
    const authorized = await this.isAuthorizedForProject(userId, projectId)
    if (!authorized) {
      throw new HttpError(403, errors.AUTH.FORBIDDEN_PROJECT_ACCESS)
    }

    // Récupération des données
    const project = await Project.findById(projectId)
      .populate("student", "firstName lastName email")
      .populate("academicSupervisor", "firstName lastName email")
      .populate("companySupervisor", "firstName lastName email")
      .lean()

    if (!project) {
      throw new HttpError(404, errors.PROJECT.NO_PROJECT)
    }

    const sprint = await Sprint.findById(sprintId).lean()
    if (!sprint) {
      throw new HttpError(404, errors.SPRINT.NOT_FOUND)
    }

    if (sprint.projectId.toString() !== projectId) {
      throw new HttpError(400, errors.SPRINT.NOT_FOUND)
    }

    // Récupération des user stories avec leurs tâches et validations
    const userStories = await UserStory.find({ sprintId: sprintId }).lean()
    const userStoriesWithTasks: any[] = []
    
    for (let us of userStories) {
      const usWithTasks: any = { ...us, tasks: [] }
      
      const tasks = await Task.find({ userStoryId: us._id })
        .populate("assignedId", "firstName lastName")
        .lean()
      
      // Récupérer les validations pour chaque tâche
      const tasksWithValidations: any[] = []
      for (let task of tasks) {
        const taskWithValidations: any = { ...task }
        const validations = await Validation.find({ taskId: task._id })
          .populate("validatorId", "firstName lastName role")
          .populate("meetingId", "title plannedDate")
          .lean()
        
        taskWithValidations.validations = validations
        tasksWithValidations.push(taskWithValidations)
      }
      
      usWithTasks.tasks = tasksWithValidations
      userStoriesWithTasks.push(usWithTasks)
    }

    // Récupération de l'historique des tâches pour ce sprint
    const taskIds = userStoriesWithTasks.flatMap(us => 
      us.tasks.map((t: any) => t._id)
    )
    
    const taskHistory = await TaskHistory.find({ 
      taskId: { $in: taskIds } 
    })
    .populate("changedBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

    return this.buildSprintReportData(project, sprint, userStoriesWithTasks, taskHistory)
  }

  async generateGlobalReport(userId: string, projectId: string) {
    // Validation des entrées
    if (!Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, errors.AUTH.INVALID_USER)
    }

    if (!Types.ObjectId.isValid(projectId)) {
      throw new HttpError(400, errors.PROJECT.NO_PROJECT)
    }

    // Vérification des autorisations
    const authorized = await this.isAuthorizedForProject(userId, projectId)
    if (!authorized) {
      throw new HttpError(403, errors.AUTH.FORBIDDEN_PROJECT_ACCESS)
    }

    // Récupération des données du projet
    const project = await Project.findById(projectId)
      .populate("student", "firstName lastName email role")
      .populate("academicSupervisor", "firstName lastName email role")
      .populate("companySupervisor", "firstName lastName email role")
      .lean()

    if (!project) {
      throw new HttpError(404, errors.PROJECT.NO_PROJECT)
    }

    // Récupération des sprints
    const sprints = await Sprint.find({ projectId: projectId })
      .sort({ order: 1 })
      .lean()
    
    // Récupération des user stories
    let userStoriesWithTasks: any[] = []
    let allTasks: any[] = []
    let allValidations: any[] = []
    
    if (sprints.length > 0) {
      const userStories = await UserStory.find({
        sprintId: { $in: sprints.map((s) => s._id) },
      }).lean()

      for (let us of userStories) {
        const usWithTasks: any = { ...us, tasks: [] }
        
        const tasks = await Task.find({ userStoryId: us._id })
          .populate("assignedId", "firstName lastName")
          .lean()
        
        // Récupérer les validations pour chaque tâche
        const tasksWithValidations: any[] = []
        for (let task of tasks) {
          const taskWithValidations: any = { ...task }
          const validations = await Validation.find({ taskId: task._id })
            .populate("validatorId", "firstName lastName role")
            .populate("meetingId", "title plannedDate")
            .lean()
          
          taskWithValidations.validations = validations
          tasksWithValidations.push(taskWithValidations)
          allValidations = [...allValidations, ...validations]
        }
        
        usWithTasks.tasks = tasksWithValidations
        userStoriesWithTasks.push(usWithTasks)
        allTasks = [...allTasks, ...tasksWithValidations]
      }
    }

    // Récupération des réunions
    const meetings = await Meeting.find({ projectId: projectId })
      .sort({ plannedDate: -1 })
      .populate("plannedBy", "firstName lastName")
      .populate("refs.referredToId")
      .lean()

    // Récupération des versions de rapport
    const reportVersions = await ReportVersion.find({ projectId: projectId })
      .sort({ versionNumber: -1 })
      .populate("uploadedBy", "firstName lastName")
      .lean()

    // Récupération de l'historique des tâches
    const taskHistory = await TaskHistory.find({ 
      taskId: { $in: allTasks.map(t => t._id) } 
    })
    .populate("changedBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

    // Construction du journal (timeline)
    const timeline = await this.buildTimeline(meetings, allValidations, taskHistory, reportVersions)

    // Calcul des validations en attente
    const pendingValidations = this.getPendingValidations(allTasks)

    return this.buildGlobalReportData(
      project,
      sprints,
      userStoriesWithTasks,
      meetings,
      allTasks,
      reportVersions,
      timeline,
      pendingValidations
    )
  }

  private async buildTimeline(meetings: any[], validations: any[], taskHistory: any[], reportVersions: any[]) {
    const timeline: any[] = []

    // Ajouter les réunions
    meetings.forEach(meeting => {
      timeline.push({
        type: TimelineEventType.MEETING,
        date: meeting.plannedDate,
        title: meeting.title,
        description: `Réunion ${meeting.status === MeetingStatus.HELD ? 'tenue' : 'planifiée'}`,
        data: {
          id: meeting._id,
          status: meeting.status,
          validatedAt: meeting.validatedAt
        }
      })
    })

    // Ajouter les validations
    validations.forEach(validation => {
      timeline.push({
        type: TimelineEventType.VALIDATION,
        date: validation.createdAt,
        title: `Validation de tâche`,
        description: `Statut: ${validation.status}`,
        data: {
          validator: validation.validatorId,
          taskId: validation.taskId,
          meetingId: validation.meetingId,
          note: validation.note
        }
      })
    })

    // Ajouter les changements de statut
    taskHistory.forEach(history => {
      timeline.push({
        type: TimelineEventType.TASK,
        date: history.createdAt,
        title: `Changement de statut de tâche`,
        description: `De ${history.fromStatus} à ${history.toStatus}`,
        data: {
          taskId: history.taskId,
          changedBy: history.changedBy,
          reason: history.reason
        }
      })
    })

    // Ajouter les dépôts de rapports
    reportVersions.forEach(version => {
      timeline.push({
        type: TimelineEventType.REPORT,
        date: version.createdAt,
        title: `Dépôt de rapport v${version.versionNumber}`,
        description: version.notes || 'Nouvelle version du rapport',
        data: {
          versionNumber: version.versionNumber,
          fileUrl: version.fileUrl,
          uploadedBy: version.uploadedBy
        }
      })
    })

    // Trier par date décroissante
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  private getPendingValidations(tasks: any[]) {
    const pendingValidations = {
      total: 0,
      byTask: [] as any[]
    }

    tasks.forEach((task: any) => {
      // Vérifier si la tâche est en statut DONE et nécessite validation
      if (task.status === TaskStatus.DONE) {
        const hasValidation = task.validations && task.validations.length > 0
        if (!hasValidation) {
          pendingValidations.total++
          pendingValidations.byTask.push({
            taskId: task._id,
            taskTitle: task.title,
            userStoryId: task.userStoryId
          })
        }
      }
    })

    return pendingValidations
  }

  private buildSprintReportData(project: any, sprint: any, userStories: any[] = [], taskHistory: any[] = []) {
    let totalTasks = 0
    let doneTasks = 0
    let standbyTasks = 0
    let inProgressTasks = 0
    let todoTasks = 0
    let validatedTasks = 0
    let pendingValidations = 0

    const userStoriesWithTasks = userStories.map((us) => {
      const userStoryTasks = us.tasks || []
      
      userStoryTasks.forEach((task: any) => {
        totalTasks++
        switch (task.status) {
          case TaskStatus.DONE:
            doneTasks++
            // Vérifier si la tâche a été validée
            if (task.validations && task.validations.length > 0) {
              validatedTasks++
            } else {
              pendingValidations++
            }
            break
          case TaskStatus.STANDBY:
            standbyTasks++
            break
          case TaskStatus.IN_PROGRESS:
            inProgressTasks++
            break
          case TaskStatus.TO_DO:
            todoTasks++
            break
        }
      })

      return {
        id: us._id,
        title: us.title,
        description: us.description || null,
        priority: us.priority || null,
        tasks: userStoryTasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description || null,
          status: task.status || TaskStatus.TO_DO,
          estimatedHours: task.estimatedHours || null,
          assignedTo: task.assignedId ? {
            id: task.assignedId._id,
            firstName: task.assignedId.firstName,
            lastName: task.assignedId.lastName
          } : null,
          validations: task.validations ? task.validations.map((v: any) => ({
            status: v.status,
            validator: v.validatorId ? {
              firstName: v.validatorId.firstName,
              lastName: v.validatorId.lastName,
              role: v.validatorId.role
            } : null,
            date: v.createdAt,
            meeting: v.meetingId ? {
              title: v.meetingId.title,
              date: v.meetingId.plannedDate
            } : null,
            note: v.note
          })) : []
        }))
      }
    })

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const validationRate = doneTasks > 0 ? Math.round((validatedTasks / doneTasks) * 100) : 0

    return {
      project: {
        id: project._id,
        title: project.title,
        description: project.description || null,
      },
      sprint: {
        id: sprint._id,
        title: sprint.title,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        order: sprint.order,
      },
      statistics: {
        totalTasks,
        doneTasks,
        inProgressTasks,
        standbyTasks,
        todoTasks,
        progress,
        validatedTasks,
        pendingValidations,
        validationRate,
        userStoriesCount: userStories.length,
      },
      userStories: userStoriesWithTasks,
      taskHistory: taskHistory.map((h: any) => ({
        taskId: h.taskId,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedBy: h.changedBy ? {
          firstName: h.changedBy.firstName,
          lastName: h.changedBy.lastName
        } : null,
        reason: h.reason,
        date: h.createdAt
      })),
      generatedAt: new Date().toISOString()
    }
  }

  private buildGlobalReportData(
    project: any,
    sprints: any[] = [],
    userStories: any[] = [],
    meetings: any[] = [],
    allTasks: any[] = [],
    reportVersions: any[] = [],
    timeline: any[] = [],
    pendingValidations: any = { total: 0, byTask: [] }
  ) {
    const totalTasks = allTasks.length
    const doneTasks = allTasks.filter(
      (task) => task.status === TaskStatus.DONE,
    ).length
    const standbyTasks = allTasks.filter(
      (task) => task.status === TaskStatus.STANDBY,
    ).length
    const inProgressTasks = allTasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS,
    ).length
    const todoTasks = allTasks.filter(
      (task) => task.status === TaskStatus.TO_DO,
    ).length

    // Compter les tâches validées
    const validatedTasks = allTasks.filter(
      (task: any) => task.validations && task.validations.length > 0
    ).length

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const validationProgress = doneTasks > 0 ? Math.round((validatedTasks / doneTasks) * 100) : 0

    const totalEstimatedHours = allTasks.reduce(
      (sum, task) => sum + (task.estimatedHours || 0),
      0,
    )
    const completedHours = allTasks
      .filter((task) => task.status === TaskStatus.DONE)
      .reduce((sum, task) => sum + (task.estimatedHours || 0), 0)

    const sprintsData = sprints.map((sprint) => {
      const sprintUserStories = userStories.filter(
        (us) => us.sprintId?.toString() === sprint._id.toString(),
      )
      const sprintTasks = allTasks.filter((task) =>
        sprintUserStories.some(
          (us) => us._id?.toString() === task.userStoryId?.toString(),
        ),
      )
      const sprintDoneTasks = sprintTasks.filter(
        (task) => task.status === TaskStatus.DONE,
      ).length
      const sprintValidatedTasks = sprintTasks.filter(
        (task: any) => task.validations && task.validations.length > 0
      ).length

      return {
        id: sprint._id,
        title: sprint.title,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        order: sprint.order,
        statistics: {
          totalTasks: sprintTasks.length,
          doneTasks: sprintDoneTasks,
          validatedTasks: sprintValidatedTasks,
          progress: sprintTasks.length > 0 
            ? Math.round((sprintDoneTasks / sprintTasks.length) * 100) 
            : 0,
          validationProgress: sprintDoneTasks > 0
            ? Math.round((sprintValidatedTasks / sprintDoneTasks) * 100)
            : 0,
          userStoriesCount: sprintUserStories.length,
        }
      }
    })

    const userStoriesData = userStories.map((us) => {
      const usTasks = allTasks.filter(
        (task) => task.userStoryId?.toString() === us._id.toString(),
      )
      const usDoneTasks = usTasks.filter(
        (task) => task.status === TaskStatus.DONE,
      ).length
      const usValidatedTasks = usTasks.filter(
        (task: any) => task.validations && task.validations.length > 0
      ).length
      const sprint = sprints.find(
        (s) => s._id.toString() === us.sprintId?.toString(),
      )

      return {
        id: us._id,
        title: us.title,
        description: us.description || null,
        priority: us.priority || null,
        sprintId: us.sprintId,
        sprintTitle: sprint?.title || null,
        statistics: {
          totalTasks: usTasks.length,
          doneTasks: usDoneTasks,
          validatedTasks: usValidatedTasks,
          progress: usTasks.length > 0 
            ? Math.round((usDoneTasks / usTasks.length) * 100) 
            : 0,
          validationProgress: usDoneTasks > 0
            ? Math.round((usValidatedTasks / usDoneTasks) * 100)
            : 0,
        },
        tasks: usTasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description || null,
          status: task.status || TaskStatus.TO_DO,
          estimatedHours: task.estimatedHours || null,
          validated: task.validations && task.validations.length > 0,
          validations: task.validations ? task.validations.map((v: any) => ({
            status: v.status,
            validator: v.validatorId ? `${v.validatorId.firstName} ${v.validatorId.lastName} (${v.validatorId.role})` : null,
            date: v.createdAt,
            meeting: v.meetingId?.title
          })) : []
        }))
      }
    })

    const meetingsData = meetings.map((meeting) => ({
      id: meeting._id,
      title: meeting.title,
      plannedDate: meeting.plannedDate,
      status: meeting.status,
      validatedAt: meeting.validatedAt,
      plannedBy: meeting.plannedBy ? {
        id: meeting.plannedBy._id,
        firstName: meeting.plannedBy.firstName,
        lastName: meeting.plannedBy.lastName
      } : null,
      refs: meeting.refs ? meeting.refs.map((ref: any) => ({
        model: ref.referredToModel,
        id: ref.referredToId
      })) : [],
      createdAt: meeting.createdAt
    }))

    const reportVersionsData = reportVersions.map((version) => ({
      versionNumber: version.versionNumber,
      fileUrl: version.fileUrl,
      notes: version.notes,
      uploadedBy: version.uploadedBy ? {
        firstName: version.uploadedBy.firstName,
        lastName: version.uploadedBy.lastName
      } : null,
      uploadedAt: version.createdAt
    }))

    // Dernières réunions (limit 5)
    const latestMeetings = meetingsData.slice(0, 5)
    
    // Derniers dépôts (limit 5)
    const latestReports = reportVersionsData.slice(0, 5)

    return {
      project: {
        id: project._id,
        title: project.title,
        description: project.description || null,
        state: project.state,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        team: {
          student: project.student ? {
            id: project.student._id,
            firstName: project.student.firstName,
            lastName: project.student.lastName,
            email: project.student.email
          } : null,
          academicSupervisor: project.academicSupervisor ? {
            id: project.academicSupervisor._id,
            firstName: project.academicSupervisor.firstName,
            lastName: project.academicSupervisor.lastName,
            email: project.academicSupervisor.email
          } : null,
          companySupervisor: project.companySupervisor ? {
            id: project.companySupervisor._id,
            firstName: project.companySupervisor.firstName,
            lastName: project.companySupervisor.lastName,
            email: project.companySupervisor.email
          } : null
        }
      },
      statistics: {
        global: {
          totalTasks,
          doneTasks,
          inProgressTasks,
          standbyTasks,
          todoTasks,
          progress,
          validatedTasks,
          pendingValidations: pendingValidations.total,
          validationProgress,
          sprintsCount: sprints.length,
          userStoriesCount: userStories.length,
          meetingsCount: meetings.length,
          reportVersionsCount: reportVersions.length,
          totalEstimatedHours,
          completedHours
        },
        byStatus: {
          done: doneTasks,
          inProgress: inProgressTasks,
          standby: standbyTasks,
          todo: todoTasks
        }
      },
      pendingValidations: {
        total: pendingValidations.total,
        tasks: pendingValidations.byTask
      },
      dashboard: {
        latestMeetings,
        latestReports,
        timeline: timeline.slice(0, 20) // Derniers 20 événements
      },
      sprints: sprintsData,
      userStories: userStoriesData,
      meetings: meetingsData,
      reportVersions: reportVersionsData,
      generatedAt: new Date().toISOString()
    }
  }
}

export default new HtmlReportService()