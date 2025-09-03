
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
import { PlusCircle } from "lucide-react"
import { MembershipForm } from "./membership-form"
import { useState } from "react"

interface AddMembershipDialogProps {
  onMembershipAdded: () => void;
}

export default function AddMembershipDialog({ onMembershipAdded }: AddMembershipDialogProps) {
  const [open, setOpen] = useState(false)

  const handleFormSubmit = () => {
    onMembershipAdded();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          Add Coaching Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Coaching Membership</DialogTitle>
          <DialogDescription>
            Fill in the client's details to create a new manual membership.
          </DialogDescription>
        </DialogHeader>
        <MembershipForm onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  )
}
