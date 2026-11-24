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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createSprintSchema,
  updateSprintSchema,
  type TcreateSprintSchema,
  type TupdateSprintSchema,
} from "@/schemas/sprint.schema"
import { SprintStatus } from "@/types/enums"
import type { Sprint } from "@/types/sprint.types"
import { extractErrorMessage } from "@/lib/error"

interface SprintFormProps {
  projectId: string
  sprint?: Sprint
  onSubmit: (data: TcreateSprintSchema | TupdateSprintSchema) => void
  onCancel: () => void
  isPending?: boolean
  error?: Error | AxiosError | null
}

export function SprintForm({
  projectId,
  sprint,
  onSubmit,
  onCancel,
  isPending,
  error,
}: SprintFormProps) {
  const isEditing = !!sprint

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0]
  }

  const form = useForm<TcreateSprintSchema | TupdateSprintSchema>({
    resolver: zodResolver(isEditing ? updateSprintSchema : createSprintSchema),
    defaultValues: isEditing
      ? {
          title: sprint.title,
          startDate: new Date(sprint.startDate).toISOString(),
          endDate: new Date(sprint.endDate).toISOString(),
          order: sprint.order,
          status: sprint.status,
        }
      : {
          title: "",
          startDate: new Date().toISOString(),
          endDate: new Date(
            new Date().setDate(new Date().getDate() + 14),
          ).toISOString(),
          order: 1,
          projectId: projectId,
        },
    mode: "onChange",
  })

  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")

  // Validation manuelle des dates (comme dans le projet)
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (start >= end) {
        form.setError("endDate", {
          type: "manual",
          message: "End date must be after start date",
        })
      } else {
        form.clearErrors("endDate")
      }
    }
  }, [startDate, endDate, form])

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error)

      if (
        errorMessage?.toLowerCase().includes("order") ||
        errorMessage?.toLowerCase().includes("exists")
      ) {
        form.setError("order", {
          type: "manual",
          message: errorMessage,
        })
      } else {
        form.setError("root", {
          type: "manual",
          message: errorMessage,
        })
      }
    }
  }, [error, form])

  const handleSubmit = (data: TcreateSprintSchema | TupdateSprintSchema) => {
    if (!isEditing) {
      onSubmit({ ...data, projectId } as TcreateSprintSchema)
    } else {
      onSubmit(data)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              <FormLabel>Sprint Title</FormLabel>
              <FormControl>
                <Input placeholder="Sprint 1: Basic features" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                      // Effacer l'erreur de date quand l'utilisateur change la valeur
                      if (form.formState.errors.endDate) {
                        form.clearErrors("endDate")
                      }
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
                      // Effacer l'erreur de date quand l'utilisateur change la valeur
                      if (form.formState.errors.endDate) {
                        form.clearErrors("endDate")
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value) || 1)
                      // Effacer l'erreur d'order quand l'utilisateur change la valeur
                      if (form.formState.errors.order) {
                        form.clearErrors("order")
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <FormField
              control={form.control}
              name="status"
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
                      <SelectItem value={SprintStatus.PLANNED}>
                        Planned
                      </SelectItem>
                      <SelectItem value={SprintStatus.IN_PROGRESS}>
                        In Progress
                      </SelectItem>
                      <SelectItem value={SprintStatus.COMPLETED}>
                        Completed
                      </SelectItem>
                      <SelectItem value={SprintStatus.DONE}>Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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
