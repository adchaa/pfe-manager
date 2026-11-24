import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, User } from "lucide-react"
import { format } from "date-fns"

interface ReportVersion {
  versionNumber: number
  fileUrl: string
  notes?: string
  uploadedBy?: {
    firstName: string
    lastName: string
  } | null
  uploadedAt: string
}

interface ReportVersionsProps {
  versions: ReportVersion[]
  title?: string
}

export function ReportVersions({
  versions,
  title = "Report Versions",
}: ReportVersionsProps) {
  if (!versions.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      Version {version.versionNumber}
                    </p>
                    {index === 0 && (
                      <Badge className="bg-blue-100 text-blue-700">
                        Latest
                      </Badge>
                    )}
                  </div>
                  {version.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {version.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {version.uploadedBy && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.uploadedBy.firstName}{" "}
                        {version.uploadedBy.lastName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(
                        new Date(version.uploadedAt),
                        "dd MMM yyyy HH:mm",
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {version.fileUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={version.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
