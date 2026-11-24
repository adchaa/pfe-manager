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
  createUserStorySchema,
  updateUserStorySchema,
  type TCreateUserStorySchema,
  type TUpdateUserStorySchema,
} from "@/schemas/userStory.schema"
import type { UserStory } from "@/types/userStory.types"
import { extractErrorMessage } from "@/lib/error"

interface UserStoryFormProps {
  sprintId: string
  userStory?: UserStory
  onSubmit: (data: TCreateUserStorySchema | TUpdateUserStorySchema) => void
  onCancel: () => void
  isPending?: boolean
  error?: Error | AxiosError | null
}

export function UserStoryForm({
  sprintId,
  userStory,
  onSubmit,
  onCancel,
  isPending,
  error,
}: UserStoryFormProps) {
  const isEditing = !!userStory

  const form = useForm<TCreateUserStorySchema | TUpdateUserStorySchema>({
    resolver: zodResolver(
      isEditing ? updateUserStorySchema : createUserStorySchema,
    ),
    defaultValues: isEditing
      ? {
          title: userStory.title,
          description: userStory.description,
          priority: userStory.priority,
        }
      : {
          title: "",
          description: "",
          priority: 1,
          sprintId: sprintId,
        },
    mode: "onChange",
  })

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error)

      if (
        errorMessage?.toLowerCase().includes("priority") ||
        errorMessage?.toLowerCase().includes("exists")
      ) {
        form.setError("priority", {
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

  const handleSubmit = (
    data: TCreateUserStorySchema | TUpdateUserStorySchema,
  ) => {
    if (!isEditing) {
      onSubmit({ ...data, sprintId } as TCreateUserStorySchema)
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
              <FormLabel>User Story Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="User Story 1: As a user, I want to..."
                  {...field}
                />
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
              <FormLabel>User Story Description</FormLabel>
              <FormControl>
                <Input placeholder="Describe the user story..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value) || 1)
                      // Effacer l'erreur de priority quand l'utilisateur change la valeur
                      if (form.formState.errors.priority) {
                        form.clearErrors("priority")
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
