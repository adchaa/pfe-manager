export interface ReportVersion {
  _id: string
  projectId: string
  versionNumber: number
  fileUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
  originalFileName: string
  uploadedBy: {
    firstName: string
    lastName: string
    email: string
  }
}

export interface ReportsResponse {
  success: boolean
  data: ReportVersion[]
}
export interface ReportResponse {
  success: boolean
  data: ReportVersion
}

export interface UploadReportResponse {
  data: ReportVersion
}

export interface UpdateReportDto {
  notes?: string
}
export interface ReportResponse {
  data: ReportVersion
}

export interface UploadReportDto {
  reportFile: File //(multer)
}

export interface UpdateReportDto {
  notes?: string
}

export interface DeleteReportResponse {
  message: string
}
