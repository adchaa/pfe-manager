import { NextFunction, Request, Response } from "express"
import { TUpdateReportSchema } from "../schemas/report.schema"
import { AuthRequest } from "../middlewares/auth.middleware"
import reportService from "../services/report.service"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"

class ReportController {
  // bech nista3mil claudinary li storage
  async UploadReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpError(400, errors.VALIDATION.FILE_IS_MISSING)
      }

      const userId = req.user?.id as string
      const notes = req.body.notes
      const originalname=  req.file.originalname
      const filePath = `http://localhost:3000/api/reports/report-file/${req.file.filename}` // TODO: hard coded url
      const report = await reportService.uploadReport(userId, filePath,notes,originalname)
      res.status(201).json({ data: report })
    } catch (error) {
      next(error)
    }
  }

  async getAllReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string
      const reports = await reportService.getAllReports(userId)
      res.status(200).json({ success: true, data: reports })
    } catch (error) {
      next(error)
    }
  }
  async updateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params
      const userId = req.user?.id as string
      const updatedData: TUpdateReportSchema = req.body
      const updatedReport = await reportService.updateReport(
        userId,
        reportId,
        updatedData,
      )
      res.status(200).json({ data: updatedReport })
    } catch (error) {
      next(error)
    }
  }

  async getReportsById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params
      const userId = req.user?.id as string
      const report = await reportService.getReportById(userId, reportId)
      res.status(200).json({ data: report })
    } catch (error) {
      next(error)
    }
  }

  async deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params
      const userId = req.user?.id as string

      await reportService.deleteReport(userId, reportId)
      res
        .status(204)
        .send("the report {$reportId} has been deleted successfully ")
    } catch {}
  }
}

export const reportController = new ReportController()
