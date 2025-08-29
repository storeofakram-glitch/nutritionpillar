"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShippingZoneForm } from "./shipping-zone-form"
import type { ShippingState } from "@/types"

interface EditShippingZoneDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    shippingZone: ShippingState;
    onDialogClose: () => void;
}

export default function EditShippingZoneDialog({ isOpen, onOpenChange, shippingZone, onDialogClose }: EditShippingZoneDialogProps) {

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
        onDialogClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Shipping Zone</DialogTitle>
          <DialogDescription>
            Update the details for "{shippingZone.state}".
          </DialogDescription>
        </DialogHeader>
        <ShippingZoneForm shippingZone={shippingZone} onFormSubmit={onDialogClose} />
      </DialogContent>
    </Dialog>
  )
}
