
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
import type { ContactSubmission } from "@/types"
import { deleteSubmission } from "@/services/contact-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteSubmissionDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    submission: ContactSubmission;
    onDialogClose: () => void;
}

export default function DeleteSubmissionDialog({ isOpen, onOpenChange, submission, onDialogClose }: DeleteSubmissionDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteSubmission(submission.id);
        if (result.success) {
            toast({
                title: "Message Deleted",
                description: `The message from "${submission.name}" has been successfully deleted.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to delete message.",
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
                    This action cannot be undone. This will permanently delete this message.
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
