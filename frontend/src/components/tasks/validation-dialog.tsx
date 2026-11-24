import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ValidationStatus } from "@/types/enums"

interface ValidationDialogProps {
  open: boolean
  status: ValidationStatus
  onClose: () => void
  onConfirm: (note?: string) => void
}

export function ValidationDialog({
  open,
  status,
  onClose,
  onConfirm,
}: ValidationDialogProps) {
  const [note, setNote] = useState("")

  useEffect(() => {
    if (open) {
      setNote("")
    }
  }, [open, status])

  const isRejected = status === ValidationStatus.REJECTED

  const handleConfirm = () => {
    const trimmedNote = note.trim()
    onConfirm(trimmedNote || undefined)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isRejected ? "Reject Task" : "Validate Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-slate-600">
            {isRejected
              ? "Add an optional note to explain why this task is rejected."
              : "Add an optional note for this validation."}
          </p>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              isRejected
                ? "Example: Missing test coverage or acceptance criteria."
                : "Example: Approved after final review."
            }
            className="min-h-[120px]"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isRejected ? "destructive" : "default"}
            className={
              isRejected ? undefined : "bg-green-600 hover:bg-green-700"
            }
            onClick={handleConfirm}
          >
            {isRejected ? "Reject" : "Validate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
