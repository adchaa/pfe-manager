import mongoose from "mongoose"
import bcrypt from "bcrypt"
import { env } from "../config/env"
import { User } from "../models/user"
import { Project } from "../models/project"
import { Sprint } from "../models/sprint"
import { UserStory } from "../models/userStory"
import { Task } from "../models/task"
import { Meeting } from "../models/meeting"
import { TaskHistory } from "../models/taskHistory"
import { ReportVersion } from "../models/reportVersion"
import { RefreshToken } from "../models/refreshToken"
import { Validation } from "../models/validation"
import {
  UserRole,
  ProjectState,
  SprintStatus,
  TaskStatus,
  MeetingStatus,
  RefModel,
} from "../models/enums"

async function seedDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI)

    const hashedPassword = await bcrypt.hash("password123", 10)

    const student = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: hashedPassword,
      role: UserRole.ETUDIANT,
    })

    const academicSupervisor = await User.create({
      firstName: "Dr. Smith",
      lastName: "Academic",
      email: "smith@univ.com",
      password: hashedPassword,
      role: UserRole.ENCADRANT_UNIVERSITAIRE,
    })

    const companySupervisor = await User.create({
      firstName: "Ms. Johnson",
      lastName: "Company",
      email: "johnson@company.com",
      password: hashedPassword,
      role: UserRole.ENCADRANT_ENTREPRISE,
    })

    const project = await Project.create({
      title: "Sample Project",
      description: "A sample project for seeding",
      state: ProjectState.ACTIVE,
      academicSupervisor: academicSupervisor._id,
      companySupervisor: companySupervisor._id,
      student: student._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days later
    })

    const sprint = await Sprint.create({
      projectId: project._id,
      title: "Sprint 1",
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days later
      endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days later
      order: 1,
      status: SprintStatus.IN_PROGRESS,
    })

    const userStory = await UserStory.create({
      title: "As a user, I want to login",
      description: "User authentication feature",
      priority: 1,
      sprintId: sprint._id,
    })

    const task = await Task.create({
      title: "Implement login form",
      description: "Create UI for login",
      userStoryId: userStory._id,
      estimatedHours: 8,
      status: TaskStatus.IN_PROGRESS,
      assignedId: student._id,
    })

    const meeting = await Meeting.create({
      title: "Sprint Planning Meeting",
      plannedDate: new Date(),
      refs: [
        {
          referredToId: userStory._id,
          referredToModel: RefModel.UserStory,
        },
      ],
      status: MeetingStatus.PLANNED,
      plannedBy: student._id,
      projectId: project._id,
    })

    await TaskHistory.create({
      taskId: task._id,
      fromStatus: TaskStatus.TO_DO,
      toStatus: TaskStatus.IN_PROGRESS,
      changedBy: student._id,
      reason: "Started working on the task",
    })

    await ReportVersion.create({
      projectId: project._id,
      versionNumber: 1,
      fileUrl: "https://example.com/report.pdf",
      notes: "Initial report",
      uploadedBy: student._id,
    })

    await Validation.create({
      taskId: task._id,
      validatorId: academicSupervisor._id,
      status: "VALIDATED",
      meetingId: meeting._id,
      note: "Looks good",
    })

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seedDatabase()
