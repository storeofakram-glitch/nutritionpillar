
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
import { useState } from "react"

interface RevokeAccessDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    athleteName: string;
    onConfirm: () => void;
}

export default function RevokeAccessDialog({ isOpen, onOpenChange, athleteName, onConfirm }: RevokeAccessDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this athlete?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the application for "{athleteName}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Athlete"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
