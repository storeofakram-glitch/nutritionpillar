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
import type { Order } from "@/types"
import { deleteOrder } from "@/services/order-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteOrderDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    order: Order;
    onDialogClose: () => void;
}

export default function DeleteOrderDialog({ isOpen, onOpenChange, order, onDialogClose }: DeleteOrderDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteOrder(order.id);
        if (result.success) {
            toast({
                title: "Order Deleted",
                description: `Order #${String(order.orderNumber).padStart(6, '0')} has been successfully deleted.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to delete order.",
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
                    This action cannot be undone. This will permanently delete order #${String(order.orderNumber).padStart(6, '0')}.
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
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
