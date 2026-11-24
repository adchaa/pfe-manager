import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
import { MeetingStatus, RefModel } from "@/types/enums"
import {
  scheduleMeetingSchema,
  updateMeetingSchema,
  type TscheduleMeetingSchema,
  type TupdateMeetingSchema,
} from "@/schemas/meeting.schema"
import type { Meeting } from "@/types/meeting.types"

interface ReferenceOption {
  id: string
  label: string
  model: RefModel
}

interface MeetingFormProps {
  projectId: string
  meeting?: Meeting
  onSubmit: (data: TscheduleMeetingSchema | TupdateMeetingSchema) => void
  onCancel: () => void
  isPending?: boolean
  referenceOptions: ReferenceOption[]
}

const formatDateForInput = (iso: string) => {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function MeetingForm({
  projectId,
  meeting,
  onSubmit,
  onCancel,
  isPending,
  referenceOptions,
}: MeetingFormProps) {
  const isEditing = Boolean(meeting)

  const form = useForm<TscheduleMeetingSchema | TupdateMeetingSchema>({
    resolver: zodResolver(isEditing ? updateMeetingSchema : scheduleMeetingSchema),
    defaultValues: isEditing
      ? {
          title: meeting?.title ?? "",
          plannedDate: meeting?.plannedDate ? formatDateForInput(meeting.plannedDate) : "",
          status: meeting?.status,
          refs: meeting?.refs ?? [],
        }
      : {
          projectId,
          title: "",
          plannedDate: "",
          status: MeetingStatus.PLANNED,
          refs: [],
        },
  })

  useEffect(() => {
    if (!meeting) {
      return
    }

    form.reset({
      title: meeting.title,
      plannedDate: formatDateForInput(meeting.plannedDate),
      status: meeting.status,
      refs: meeting.refs ?? [],
    })
  }, [meeting, form])

  const refs = form.watch("refs") ?? []

  const getOptionsByModel = (model: RefModel) =>
    referenceOptions.filter((option) => option.model === model)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting title</FormLabel>
              <FormControl>
                <Input placeholder="Sprint review with supervisors" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="plannedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Planned date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={MeetingStatus.PLANNED}>Planned</SelectItem>
                    <SelectItem value={MeetingStatus.HELD}>Held</SelectItem>
                    <SelectItem value={MeetingStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={MeetingStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">References (optional)</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = form.getValues("refs") ?? []
                form.setValue("refs", [
                  ...current,
                  { referredToModel: RefModel.UserStory, referredToId: "" },
                ])
              }}
            >
              Add ref
            </Button>
          </div>

          {refs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No references added.</p>
          ) : (
            refs.map((_, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.5fr_auto]">
                <FormField
                  control={form.control}
                  name={`refs.${idx}.referredToModel`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue(`refs.${idx}.referredToId`, "")
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={RefModel.UserStory}>User Story</SelectItem>
                          <SelectItem value={RefModel.Task}>Task</SelectItem>
                          <SelectItem value={RefModel.ReportVersion}>Report</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`refs.${idx}.referredToId`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          getOptionsByModel(
                            (form.getValues(`refs.${idx}.referredToModel`) as RefModel) ??
                              RefModel.UserStory,
                          ).length === 0
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select linked item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getOptionsByModel(
                            (form.getValues(`refs.${idx}.referredToModel`) as RefModel) ??
                              RefModel.UserStory,
                          ).map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => {
                    const current = form.getValues("refs") ?? []
                    form.setValue(
                      "refs",
                      current.filter((__, refIdx) => refIdx !== idx),
                    )
                  }}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update meeting" : "Plan meeting"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
