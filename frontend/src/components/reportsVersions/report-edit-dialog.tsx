import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UpdateReportSchema, type TUpdateReportSchema } from "@/schemas/report.schema"
import type { ReportVersion } from "@/types/report.types"
import { extractErrorMessage } from "@/lib/error"

interface ReportEditDialogProps {
  report: ReportVersion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reportId: string, data: TUpdateReportSchema) => void
  isPending?: boolean
  error?: Error | AxiosError | null
}

export function ReportEditDialog({
  report,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  error,
}: ReportEditDialogProps) {
  const form = useForm<TUpdateReportSchema>({
    resolver: zodResolver(UpdateReportSchema),
    defaultValues: { notes: report?.notes ?? "" },
    mode: "onChange",
  })

  // Reset form when report changes
  useEffect(() => {
    if (report) {
      form.reset({ notes: report.notes ?? "" })
    }
  }, [report, form])

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error)
      form.setError("root" as any, { type: "manual", message: errorMessage })
    }
  }, [error, form])

  const handleSubmit = (data: TUpdateReportSchema) => {
    if (!report) return
    onSubmit(report._id, data)
  }

  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Report Notes — Version {report.versionNumber}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {(form.formState.errors as any).root && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {(form.formState.errors as any).root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Update notes for this version..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
