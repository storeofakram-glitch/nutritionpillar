
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { CoachWithFinancials } from "@/types";
import { useState } from "react";
import { updateCoachCommission } from "@/services/coach-finance-service";

interface EditCommissionDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    coach: CoachWithFinancials;
    onDialogClose: () => void;
}

export default function EditCommissionDialog({ isOpen, onOpenChange, coach, onDialogClose }: EditCommissionDialogProps) {
    const { toast } = useToast();
    const [rate, setRate] = useState(coach.commissionRate || 70);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateCoachCommission(coach.id, rate);
        if (result.success) {
            toast({ title: "Commission Updated", description: `Rate for ${coach.name} set to ${rate}%.` });
            onDialogClose();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Commission Rate</DialogTitle>
                    <DialogDescription>Set the percentage of client fees that {coach.name} will earn.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                    <Input
                        id="commission-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onDialogClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
