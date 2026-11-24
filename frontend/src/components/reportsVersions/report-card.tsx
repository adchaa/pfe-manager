import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Trash2, Eye, FileText, Download, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { ReportVersion } from "@/types/report.types"
import { downloadReport } from "@/lib/download"

interface ReportCardProps {
  report: ReportVersion
  isStudent: boolean
  onView: (report: ReportVersion) => void
  onEdit: (report: ReportVersion) => void
  onDelete: (report: ReportVersion) => void
}

export function ReportCard({ report, isStudent, onView, onEdit, onDelete }: ReportCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!report.fileUrl) return
    setIsDownloading(true)
    await downloadReport(report.fileUrl,report.originalFileName || `report-v${report.versionNumber}.pdf`)
    setIsDownloading(false)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <FileText className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <CardTitle className="text-lg">{report.originalFileName ?? `Version ${report.versionNumber}`}</CardTitle>
              {report.notes && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.notes}</p>
              )}
            </div>
          </div>

          <div className="flex gap-1 ml-2">
            <Button variant="ghost" size="icon" onClick={() => onView(report)} title="View Details">
              <Eye className="h-4 w-4" />
            </Button>

           
            {report.fileUrl && (
              <Button
                variant="ghost"
                size="icon"
                title="Download"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <Download className="h-4 w-4 text-blue-500" />
                )}
              </Button>
            )}

            {isStudent && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(report)}
                  title="Edit notes"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(report)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            v{report.versionNumber}
          </Badge>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Uploaded on {report.createdAt ? format(new Date(report.createdAt), "PPP") : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
