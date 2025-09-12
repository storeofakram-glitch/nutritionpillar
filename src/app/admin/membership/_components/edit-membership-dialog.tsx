

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MembershipForm } from "./membership-form"
import type { Membership } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditMembershipDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    membership: Membership;
    onDialogClose: () => void;
}

export default function EditMembershipDialog({ isOpen, onOpenChange, membership, onDialogClose }: EditMembershipDialogProps) {

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
          <DialogTitle>Edit Supplement Guide</DialogTitle>
          <DialogDescription>
            Manage product recommendations and usage for {membership.customerName}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            <MembershipForm membership={membership} onFormSubmit={onDialogClose} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
