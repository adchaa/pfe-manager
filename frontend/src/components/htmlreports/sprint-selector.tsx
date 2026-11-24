import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Sprint } from "@/types/sprint.types"

interface SprintSelectorProps {
  sprints: Sprint[]
  selectedSprintId: string
  onSelect: (sprintId: string) => void
}

export function SprintSelector({
  sprints,
  selectedSprintId,
  onSelect,
}: SprintSelectorProps) {
  return (
    <div className="bg-card p-4 rounded-lg border">
      <label className="text-sm font-medium text-foreground mb-2 block">
        Select Sprint
      </label>
      <Select value={selectedSprintId} onValueChange={onSelect}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Choose a sprint" />
        </SelectTrigger>
        <SelectContent>
          {sprints.map((sprint) => (
            <SelectItem key={sprint._id} value={sprint._id}>
              Sprint {sprint.order}: {sprint.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
