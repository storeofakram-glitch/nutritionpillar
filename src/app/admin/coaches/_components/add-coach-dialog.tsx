
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { CoachForm } from "./coach-form"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddCoachDialogProps {
  onCoachAdded: () => void;
}

export default function AddCoachDialog({ onCoachAdded }: AddCoachDialogProps) {
  const [open, setOpen] = useState(false)

  const handleFormSubmit = () => {
    onCoachAdded();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          Add Person
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Coach or Expert</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new person to your site.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
            <CoachForm onFormSubmit={handleFormSubmit} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
