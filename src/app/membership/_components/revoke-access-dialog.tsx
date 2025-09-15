
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
    const [isArchiving, setIsArchiving] = useState(false);

    const handleConfirm = async () => {
        setIsArchiving(true);
        await onConfirm();
        setIsArchiving(false);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Archive this athlete?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will move the application for "{athleteName}" to your history. The client will no longer appear in your active list. This action can be reversed from the admin panel if needed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isArchiving}
                        >
                            {isArchiving ? "Archiving..." : "Archive Athlete"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
