import api from "./api"
import type { SprintReport, GlobalReport } from "@/types/htmlreport.types"

class HtmlReportService {
  async generateSprintReport(projectId: string, sprintId: string): Promise<SprintReport> {
    const response = await api.get(
      `/html-reports/projects/${projectId}/sprints/${sprintId}/html-report`,
    )
    return response.data.data
  }

  async generateGlobalReport(projectId: string): Promise<GlobalReport> {
    const response = await api.get(`/html-reports/projects/${projectId}/global-html-report`)
    return response.data.data
  }
}

export default new HtmlReportService()
