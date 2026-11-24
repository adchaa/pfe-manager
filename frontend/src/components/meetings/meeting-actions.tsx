import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MeetingStatus } from "@/types/enums"

interface MeetingActionsProps {
  count: number
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onCreate: () => void
  canCreate: boolean
}

export function MeetingActions({
  count,
  statusFilter,
  onStatusFilterChange,
  onCreate,
  canCreate,
}: MeetingActionsProps) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Meetings</h2>
          <p className="text-sm text-muted-foreground">{count} total meeting(s)</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value={MeetingStatus.PLANNED}>Planned</SelectItem>
              <SelectItem value={MeetingStatus.HELD}>Held</SelectItem>
              <SelectItem value={MeetingStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={MeetingStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {canCreate && <Button onClick={onCreate}>Plan meeting</Button>}
        </div>
      </div>
    </div>
  )
}
