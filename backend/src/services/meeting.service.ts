import { keyof, string } from "zod"
import { RefModel, UserRole } from "../models/enums"
import { Meeting } from "../models/meeting"
import { Project } from "../models/project"
import { ReportVersion } from "../models/reportVersion"
import { Task } from "../models/task"
import { UserStory } from "../models/userStory"
import { TscheduleMeetingSchema } from "../schemas/meeting.schema"
import { th } from "zod/v4/locales"
import errors from "../util/errorsContants"
import { User } from "../models/user"
import { roleGuard } from "../middlewares/roleGuard.middleware"

class MeetingService {
  async scheduleMeeting(data: TscheduleMeetingSchema, plannedBy: string) {
    const project = await Project.findOne({
      _id: data.projectId,
      student: plannedBy,
    })
    if (!project) {
      throw new Error("Project not found ")
    }
    if (data.refs && data.refs.length > 0) {
      for (const ref of data.refs) {
        if (ref.referredToModel === RefModel.UserStory) {
          const userStory = await UserStory.findById(ref.referredToId)
          if (!userStory)
            throw new Error(errors.VALIDATION.USER_STORY_NOT_FOUND.message)
        }

        if (ref.referredToModel === RefModel.Task) {
          const task = await Task.findById(ref.referredToId)
          if (!task) throw new Error(errors.VALIDATION.TASK_NOT_FOUND.message)
        }

        if (ref.referredToModel === RefModel.ReportVersion) {
          const report = await ReportVersion.findById(ref.referredToId)
          if (!report)
            throw new Error(errors.VALIDATION.REPORT_NOT_FOUND.message)
        }
      }
    }

    const meeting = await Meeting.create({ ...data, plannedBy })
    return meeting
  }

  async getMeetingById(id: string, userId: string) {
    const meeting = await Meeting.findById(id)
    if (!meeting) {
      throw new Error(errors.VALIDATION.MEETING_NOT_FOUND.message)
    }
    if (meeting.plannedBy.toString() !== userId.toString()) {
      throw new Error(errors.AUTH.UNAUTHORIZED.message)
    }
    return meeting
  }

  async getAllMeetings(userId: string) {
    const user = await User.findById(userId)
    if (!user) throw new Error(errors.AUTH.UNAUTHORIZED.message)

    let projectIds: string[] = []

    switch (user.role) {
      case UserRole.ETUDIANT: {
        const project = await Project.findOne({ student: userId }).select("_id")
        if (!project) return []
        projectIds = [project._id.toString()]
        break
      }

      case UserRole.ENCADRANT_UNIVERSITAIRE: {
        const projects = await Project.find({
          academicSupervisor: userId,
        }).select("_id")
        projectIds = projects.map((p) => p._id.toString())
        break
      }

      case UserRole.ENCADRANT_ENTREPRISE: {
        const projects = await Project.find({
          companySupervisor: userId,
        }).select("_id")
        projectIds = projects.map((p) => p._id.toString())
        break
      }

      default:
        throw new Error(errors.AUTH.UNAUTHORIZED.message)
    }

    const meetings = await Meeting.find({
      projectId: { $in: projectIds },
    }).sort({ plannedDate: -1 })

    return meetings.map((m) => m.toObject())
  }

  async deleteMeeting(id: string, userId: string) {
    const deletedMeeting = await Meeting.findByIdAndDelete(id)
    if (!deletedMeeting) {
      throw new Error(errors.VALIDATION.MEETING_NOT_FOUND.message)
    }
    if (deletedMeeting.plannedBy.toString() !== userId.toString()) {
      throw new Error(errors.AUTH.UNAUTHORIZED.message)
    }
    return deletedMeeting
  }

  async updateMeetingByStudent(
    id: string,
    userId: string,
    data: Partial<TscheduleMeetingSchema>,
  ) {
    const meeting = await Meeting.findById(id)
    if (!meeting) {
      throw new Error("Meeting not found")
    }
    if (meeting.plannedBy.toString() !== userId.toString()) {
      throw new Error("Unauthorized access")
    }
    const updatableFields: (keyof TscheduleMeetingSchema)[] = [
      "title",
      "plannedDate",
      "status",
      "refs",
    ]

    updatableFields.forEach((field) => {
      if (data[field] !== undefined) {
        meeting[field] = data[field] as any
      }
    })

    await meeting.save()
    return meeting
  }

  async validateMeetingBySupervisor(id: string, supervisorId: string) {
    const meeting = await Meeting.findById(id)
    if (!meeting) {
      throw new Error(errors.VALIDATION.MEETING_NOT_FOUND.message)
    }
    const project = await Project.findById(meeting.projectId)
    if (!project) {
      throw new Error(errors.PROJECT.NO_PROJECT.message)
    }
    if (
      project.academicSupervisor?._id.toString() !== supervisorId.toString()
    ) {
      throw new Error(errors.AUTH.UNAUTHORIZED.message)
    }
    meeting.validatedAt = new Date()
    await meeting.save()
    return meeting
  }
}

export default new MeetingService()
