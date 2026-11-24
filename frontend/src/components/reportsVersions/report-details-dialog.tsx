import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2, User } from "lucide-react"
import { format } from "date-fns"
import type { ReportVersion } from "@/types/report.types"
import { downloadReport } from "@/lib/download"

interface ReportDetailsDialogProps {
  report: ReportVersion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  if (!report) return null

  const handleDownload = async () => {
    if (!report.fileUrl) return
    setIsDownloading(true)
    await downloadReport(
      report.fileUrl,
      report.originalFileName || `report-v${report.versionNumber}.pdf`,
    )
    setIsDownloading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold">
                {report.originalFileName ?? `Version ${report.versionNumber}`}
              </h2>
              <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700">
                v{report.versionNumber}
              </Badge>
            </div>
          </div>

          {report.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              <p className="text-sm text-gray-800">{report.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Upload Date</h3>
            <p className="text-sm">
              {report.createdAt ? format(new Date(report.createdAt), "PPPp") : "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Updated Date</h3>
            <p className="text-sm">
              {report.updatedAt ? format(new Date(report.updatedAt), "PPPp") : "N/A"}
            </p>
          </div>
          {report.uploadedBy && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Uploaded By</h3>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{report.uploadedBy.firstName}</span>
                <span className="font-medium">{report.uploadedBy.lastName}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{report.uploadedBy.email}</span>
              </div>
            </div>
          )}

          {report.fileUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">File</h3>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? "Downloading..." : "Download Report"}
              </button>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
