
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
import type { TeamApplicationData } from "@/services/join-team-service"
import { deleteTeamApplication } from "@/services/join-team-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteTeamApplicationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    application: TeamApplicationData;
    onDialogClose: () => void;
}

export default function DeleteTeamApplicationDialog({ isOpen, onOpenChange, application, onDialogClose }: DeleteTeamApplicationDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteTeamApplication(application.id);
        if (result.success) {
            toast({
                title: "Application Deleted",
                description: `The application from "${application.name}" has been permanently deleted.`,
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
                    This action cannot be undone. This will permanently delete the application from "{application.name}".
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
