
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { ClientPayment } from "@/types"
import { deleteClientPayment } from "@/services/coach-finance-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteClientPaymentDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    payment: ClientPayment;
    onDialogClose: () => void;
}

export default function DeleteClientPaymentDialog({ isOpen, onOpenChange, payment, onDialogClose }: DeleteClientPaymentDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteClientPayment(payment.id);
        if (result.success) {
            toast({
                title: "Payment Deleted",
                description: `The payment from "${payment.clientName}" has been successfully deleted.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to delete payment.",
            });
        }
        setIsDeleting(false);
        onDialogClose();
    };

    const handleOpenChange = (open: boolean) => {
      onOpenChange(open);
      if (!open) {
          onDialogClose();
      }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the payment of DZD {payment.amount.toFixed(2)} from "{payment.clientName}". 
                    This will also reverse the transaction from the coach's earnings and pending payouts if applicable.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </Button>
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
