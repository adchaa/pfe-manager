import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { AxiosError } from "axios"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createProjectSchema,
  updateProjectSchema,
  type TcreateProjectSchema,
  type TupdateProjectSchema,
} from "@/schemas/project.schema"
import { ProjectState } from "@/types/enums"
import type { Project } from "@/types/project.types"
import { extractErrorMessage } from "@/lib/error"

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: TcreateProjectSchema | TupdateProjectSchema) => void
  onCancel: () => void
  isPending?: boolean
  error?: Error | AxiosError | null
}

export function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isPending,
  error,
}: ProjectFormProps) {
  const isEditing = !!project

  const formatDateForInput = (isoString: string) => {
    return new Date(isoString).toISOString().split("T")[0]
  }

  const form = useForm<TcreateProjectSchema | TupdateProjectSchema>({
    resolver: zodResolver(
      isEditing ? updateProjectSchema : createProjectSchema,
    ),
    defaultValues: isEditing
      ? {
          title: project.title,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          state: project.state,
        }
      : {
          title: "",
          description: "",
          academicSupervisor: "",
          companySupervisor: "",
          startDate: new Date().toISOString(),
          endDate: new Date(
            new Date().setMonth(new Date().getMonth() + 6),
          ).toISOString(),
        },
    mode: "onChange",
  })

  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")

  useEffect(() => {
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      form.setError("endDate", {
        type: "manual",
        message: "End date must be after start date",
      })
    } else {
      form.clearErrors("endDate")
    }
  }, [startDate, endDate, form])

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error)
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      })
    }
  }, [error, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="My PFE Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Project description..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="academicSupervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Supervisor Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="supervisor@univ.tn"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companySupervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Supervisor Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="supervisor@company.tn"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? formatDateForInput(field.value) : ""}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      date.setHours(12, 0, 0, 0)
                      field.onChange(date.toISOString())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? formatDateForInput(field.value) : ""}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      date.setHours(12, 0, 0, 0)
                      field.onChange(date.toISOString())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ProjectState.ACTIVE}>Active</SelectItem>
                    <SelectItem value={ProjectState.ARCHIVED}>
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
