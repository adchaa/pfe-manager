import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface ReportActionsProps {
  reportCount: number
  isStudent: boolean
  onUpload: () => void
}

export function ReportActions({ reportCount, isStudent, onUpload }: ReportActionsProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold">Report Versions</h2>
        <p className="text-muted-foreground mt-1">
          {reportCount} version(s) uploaded
        </p>
      </div>
      {isStudent && (
        <Button onClick={onUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Version
        </Button>
      )}
    </div>
  )
}
