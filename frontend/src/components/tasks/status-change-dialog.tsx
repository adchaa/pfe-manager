import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { TaskStatus } from "@/types/enums"

interface StatusChangeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  oldStatus: TaskStatus
  newStatus: TaskStatus
}

export function StatusChangeDialog({
  open,
  onClose,
  onConfirm,
  oldStatus,
  newStatus,
}: StatusChangeDialogProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    console.log("Sending reason:", reason)
    onConfirm(reason)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            Justification Required
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-600">
            You are moving this task from{" "}
            <span className="font-bold">{oldStatus}</span> to{" "}
            <span className="font-bold text-primary">{newStatus}</span>. Please
            provide a reason for this change:
          </p>
          <Textarea
            placeholder="Ex: Need feedback from supervisor, Blocked by bug #12, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!reason.trim()} onClick={handleConfirm}>
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
