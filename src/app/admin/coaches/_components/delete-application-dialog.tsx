
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
import type { CoachingApplication } from "@/types"
import { deleteApplication } from "@/services/application-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteApplicationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    application: CoachingApplication;
    onDialogClose: () => void;
}

export default function DeleteApplicationDialog({ isOpen, onOpenChange, application, onDialogClose }: DeleteApplicationDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteApplication(application.id);
        if (result.success) {
            toast({
                title: "Application Deleted",
                description: `The application from "${application.applicant.name}" has been permanently deleted.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to delete application.",
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
                    This action cannot be undone. This will permanently delete this application.
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
