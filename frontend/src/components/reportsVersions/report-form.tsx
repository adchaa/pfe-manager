import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { AxiosError } from "axios"
import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { extractErrorMessage } from "@/lib/error"

interface ReportFormProps {
  onSubmit: (file: File, notes?: string) => void
  onCancel: () => void
  isPending?: boolean
  error?: Error | AxiosError | null
}

type FormValues = TUpdateReportSchema

export function ReportForm({ onSubmit, onCancel, isPending, error }: ReportFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateReportSchema),
    defaultValues: { notes: "" },
    mode: "onChange",
  })
  useEffect(() => {
    if (error) {
      form.setError("root", {
        type: "manual",
        message: extractErrorMessage(error),
      })
    }
  }, [error, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)

    if (file) form.clearErrors("root")
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = (data: FormValues) => {
    if (!selectedFile) {
      form.setError("root", {
        type: "manual",
        message: "Please select a PDF file to upload.",
      })
      return
    }
    onSubmit(selectedFile, data.notes)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Erreur globale */}
        {form.formState.errors.root && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Zone de sélection de fichier */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Report File <span className="text-red-500">*</span>
          </label>

          {!selectedFile ? (
            <div
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">Click to select a PDF file</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-700 font-medium truncate max-w-[300px]">
                📄 {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Notes optionnelles */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Add notes about this version..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !selectedFile}>
            {isPending ? "Uploading..." : "Upload Report"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
