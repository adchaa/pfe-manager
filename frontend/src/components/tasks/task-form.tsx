import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"

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

import { createTaskSchema, updateTaskSchema } from "@/schemas/tasks.schema"
import type { Task } from "@/types/task.types"
import { toast } from "sonner"
import projectService from "@/services/project.service"

interface TaskFormValues {
  title: string
  description: string
  userStoryId: string
  estimatedHours: number
  supervisorEmail: string
}

interface TaskFormProps {
  userStoryId: string
  task?: Task
  onSubmit: (data: TaskFormValues) => Promise<void>
  onCancel: () => void
  isPending?: boolean
}

export function TaskForm({
  userStoryId,
  task,
  onSubmit,
  onCancel,
  isPending,
}: TaskFormProps) {
  const isEditing = !!task

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(
      isEditing ? updateTaskSchema : createTaskSchema,
    ) as any,
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      userStoryId:
        typeof task?.userStoryId === "object"
          ? (task.userStoryId as any)._id
          : task?.userStoryId || userStoryId,
      estimatedHours: task?.estimatedHours || 0,
      supervisorEmail: (task?.assignedId as any)?.email || "",
    },
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        userStoryId:
          typeof task.userStoryId === "object"
            ? (task.userStoryId as any)._id
            : task.userStoryId,
        estimatedHours: task.estimatedHours || 0,
        supervisorEmail: (task.assignedId as any)?.email || "",
      })
    }
  }, [task, form])

  const handleInternalSubmit = async (data: TaskFormValues) => {
    try {
      const user = await projectService.getUserByEmail(data.supervisorEmail)

      if (user && user.role === "ETUDIANT") {
        form.setError("supervisorEmail", {
          type: "manual",
          message: "A student cannot be assigned as a supervisor.",
        })
        toast.error("Invalid Role", {
          description:
            "Please select a teacher or staff member as the supervisor.",
        })
        return
      }

      await onSubmit(data)
    } catch (err) {
      form.setError("supervisorEmail", {
        type: "manual",
        message: "User not found or connection error.",
      })
      toast.error("User Lookup Failed", {
        description: "Could not verify the supervisor email address.",
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleInternalSubmit)}
        className="space-y-4"
      >
        {form.formState.errors.root && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title..." {...field} />
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
                  placeholder="Technical details and requirements..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supervisorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="example@isamm.uma.tn"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-[100px]">
            {isPending
              ? "Saving..."
              : isEditing
                ? "Update Task"
                : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
