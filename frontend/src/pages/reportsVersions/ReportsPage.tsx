import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReportActions } from "@/components/reportsVersions/report-actions"
import { ReportCard } from "@/components/reportsVersions/report-card"
import { ReportEmptyState } from "@/components/reportsVersions/report-empty-state"
import { ReportForm } from "@/components/reportsVersions/report-form"
import { ReportDetailsDialog } from "@/components/reportsVersions/report-details-dialog"
import { ReportEditDialog } from "@/components/reportsVersions/report-edit-dialog"

import reportService from "@/services/report.service"
import type { ReportVersion } from "@/types/report.types"
import type { TUpdateReportSchema } from "@/schemas/report.schema"
import { useAuthPermissions } from "@/services/auth.service"
import { AppLayout } from "@/components/layout/app-layout"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function ReportsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isStudent } = useAuthPermissions()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get("projectId")

  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewReport, setViewReport] = useState<ReportVersion | null>(null)
  const [editReport, setEditReport] = useState<ReportVersion | null>(null)
  const [deletingReport, setDeletingReport] = useState<ReportVersion | null>(null)

  const { data: allReports = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportService.getAllReports(),
  })

  const reports = allReports.filter((r: ReportVersion) => r.projectId === projectId)

  const uploadMutation = useMutation({
    mutationFn: ({ file, notes }: { file: File; notes?: string }) =>
      reportService.uploadReport(file, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setUploadOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: TUpdateReportSchema }) =>
      reportService.updateReport(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setEditReport(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (reportId: string) => reportService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setDeletingReport(null)
    },
  })

  const handleDelete = (report: ReportVersion) => {
    setDeletingReport(report)
  }

  if (!projectId) {
    return (
      <AppLayout title="Reports">
        <div className="h-[60vh] flex items-center justify-center text-gray-500 text-lg">
          ⚠️ Please select a project to view its reports.
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout title="Reports" subtitle="Loading reports...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading reports...</span>
        </div>
      </AppLayout>
    )
  }

  if (fetchError) {
    return (
      <AppLayout title="Reports" subtitle="Error loading reports">
        <Alert variant="destructive">
          <AlertDescription>Failed to load reports.</AlertDescription>
        </Alert>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Reports"
      showBackButton
      onBack={() => navigate(-1)}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <ReportActions
          reportCount={reports.length}
          isStudent={isStudent}
          onUpload={() => setUploadOpen(true)}
        />

        {reports.length === 0 ? (
          <ReportEmptyState isStudent={isStudent} onUpload={() => setUploadOpen(true)} />
        ) : (
          <div className="space-y-4">
            {reports.map((report: ReportVersion) => (
              <ReportCard
                key={report._id}
                report={report}
                isStudent={isStudent}
                onView={setViewReport}
                onEdit={setEditReport}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Upload dialog */}
        {isStudent && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload New Report Version</DialogTitle>
              </DialogHeader>
              <ReportForm
                onSubmit={(file, notes) => uploadMutation.mutate({ file, notes })}
                onCancel={() => setUploadOpen(false)}
                isPending={uploadMutation.isPending}
                error={uploadMutation.error}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* View dialog */}
        <ReportDetailsDialog
          report={viewReport}
          open={!!viewReport}
          onOpenChange={(open) => !open && setViewReport(null)}
        />

        {/* Edit dialog */}
        {isStudent && (
          <ReportEditDialog
            report={editReport}
            open={!!editReport}
            onOpenChange={(open) => !open && setEditReport(null)}
            onSubmit={(reportId, data) => updateMutation.mutate({ reportId, data })}
            isPending={updateMutation.isPending}
            error={updateMutation.error}
          />
        )}

        {/* Delete confirmation dialog */}
        {deletingReport && (
          <AlertDialog open={!!deletingReport} onOpenChange={() => setDeletingReport(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Report Version?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is irreversible. Version #{deletingReport.versionNumber} will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => deletingReport && deleteMutation.mutate(deletingReport._id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AppLayout>
  )
}
