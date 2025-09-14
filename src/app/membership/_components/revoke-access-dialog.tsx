
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
    const [isRevoking, setIsRevoking] = useState(false);

    const handleConfirm = async () => {
        setIsRevoking(true);
        await onConfirm();
        setIsRevoking(false);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to revoke access?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will deactivate the membership for "{athleteName}". Their status will be changed to 'rejected' and they will lose access to their supplement guide. This can be undone later by reactivating them from the admin panel.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isRevoking}
                        >
                            {isRevoking ? "Revoking..." : "Revoke Access"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
