
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
import type { Expense } from "@/types"
import { deleteExpense } from "@/services/expense-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteExpenseDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    expense: Expense;
    onDialogClose: () => void;
}

export default function DeleteExpenseDialog({ isOpen, onOpenChange, expense, onDialogClose }: DeleteExpenseDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteExpense(expense.id);
        if (result.success) {
            toast({
                title: "Expense Deleted",
                description: `The expense "${expense.description}" has been successfully deleted.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to delete expense.",
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
                    This action cannot be undone. This will permanently delete the expense: "{expense.description}" for DZD {expense.amount.toFixed(2)}.
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
