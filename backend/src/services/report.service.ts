import { string } from "zod"
import { Project } from "../models/project"
import { ReportVersion } from "../models/reportVersion"
import { TUpdateReportSchema } from "../schemas/report.schema"
import errors from "../util/errorsContants"
import { HttpError } from "../util/httpError"

class ReportService {
  async isAuthorizedForProject(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const project = await Project.findById(projectId)
    if (!project) return false

    const isAuthorized =
      project.student?.toString() === userId ||
      project.academicSupervisor?.toString() === userId ||
      project.companySupervisor?.toString() === userId

    return isAuthorized
  }

  async uploadReport(userId: string, fileUrl: string,notes?: string,originalFileName?: string,) {
    const project = await Project.findOne({ student: userId })
    if (!project) {
      throw new HttpError(404, errors.PROJECT.NO_PROJECT)
    }
    if (project?.student?.toString() !== userId) {
      throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)
    }
    
    const latestReport = await ReportVersion.findOne({
      projectId: project._id,
    })
      .sort({ versionNumber: "desc" })
      .select("versionNumber")

    const newReportVersion = latestReport ? latestReport.versionNumber + 1 : 0

  const report = await ReportVersion.create({
  uploadedBy: userId,
  versionNumber: newReportVersion,
  fileUrl,
  projectId: project._id,
  notes,
  originalFileName,
})

return report.populate("uploadedBy", "firstName lastName email")
  }
  
  //SERVICE get a report by id
  async getReportById(userId: string, reportId: string) {
    const report = await ReportVersion.findById(reportId).populate("uploadedBy", "firstName lastName email")
    if (!report) throw new HttpError(404, errors.VALIDATION.REPORT_NOT_FOUND)
    const projectId = report.projectId
    if (!projectId) {
      throw new HttpError(500, errors.REPORT.MISSING_PROJECT_ID)
    }
    const isAuthorized = await this.isAuthorizedForProject(
      userId,
      projectId.toString(),
    )
    if (!isAuthorized) throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)

    return report
  }
  //SERVICE get all reports
async getAllReports(userId: string) {
  const projectsList = await Project.find({
    $or: [
      { student: userId },
      { companySupervisor: userId },
      { academicSupervisor: userId },
    ],
  }).select("_id")

  const ids = projectsList.map(p => p._id)

  const reportsList = await ReportVersion.find({
    projectId: { $in: ids },
  })
  .populate("uploadedBy", "firstName lastName email")
  .sort({ versionNumber: -1 })

  return reportsList
}
  // SERVICE update  a report
  async updateReport(
    userId: string,
    reportId: string,
    updatedData: TUpdateReportSchema,
  ) {
    const report = await ReportVersion.findById(reportId)
    if (!report) throw new HttpError(404, errors.VALIDATION.REPORT_NOT_FOUND)

    if (report?.uploadedBy?.toString() !== userId) {
      throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)
    }
    const updatedReport = await ReportVersion.findByIdAndUpdate(
      reportId,
      updatedData,
      { new: true, runValidators: true },
    ) //option lezma for mongoose to force modification and validate the schema

    return updatedReport
  }

  //ToDo: SERVICE delete  a project
  async deleteReport(userId: string, reportId: string) {
    const report = await ReportVersion.findById(reportId)
    if (!report) throw new HttpError(404, errors.VALIDATION.REPORT_NOT_FOUND)

    if (report?.uploadedBy?.toString() !== userId) {
      throw new HttpError(403, errors.AUTH.FORBIDDEN_USER)
    }

    await ReportVersion.findByIdAndDelete(reportId)
    return true
  }
}
export default new ReportService()
