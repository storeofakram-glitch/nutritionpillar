
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CoachForm } from "./coach-form"
import type { Coach } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditCoachDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    coach: Coach;
    onDialogClose: () => void;
}

export default function EditCoachDialog({ isOpen, onOpenChange, coach, onDialogClose }: EditCoachDialogProps) {

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
        onDialogClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Details</DialogTitle>
          <DialogDescription>
            Update the details for "{coach.name}".
          </DialogDescription>
        </DialogHeader>
         <ScrollArea className="max-h-[80vh]">
            <CoachForm coach={coach} onFormSubmit={onDialogClose} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
