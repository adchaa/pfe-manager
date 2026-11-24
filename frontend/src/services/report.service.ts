// src/services/report.service.ts
import api from "./api"
import type {
  ReportVersion,
  ReportsResponse,
  ReportResponse,
  UpdateReportDto,
} from "@/types/report.types"

class ReportService {
  async getAllReports(): Promise<ReportVersion[]> {
    const response = await api.get<ReportsResponse>("/reports")
    return response.data.data
  }

  async getReportById(id: string): Promise<ReportVersion> {
    const response = await api.get<ReportResponse>(`/reports/${id}`)
    return response.data.data
  }

  async uploadReport(file: File, notes?: string): Promise<ReportVersion> {
    const formData = new FormData()
    formData.append("reportFile", file)
    if (notes) formData.append("notes", notes)

    const response = await api.post<ReportResponse>("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    return response.data.data
  }

  async updateReport(id: string, data: UpdateReportDto): Promise<ReportVersion> {
    const response = await api.patch<ReportResponse>(`/reports/${id}`, data)
    return response.data.data
  }

  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`)
  }
}

export default new ReportService()
