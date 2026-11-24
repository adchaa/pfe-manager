import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload } from "lucide-react"

interface ReportEmptyStateProps {
  isStudent: boolean
  onUpload: () => void
}

export function ReportEmptyState({ isStudent, onUpload }: ReportEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">No reports uploaded yet</p>
        {isStudent && (
          <Button variant="outline" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload first report
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
