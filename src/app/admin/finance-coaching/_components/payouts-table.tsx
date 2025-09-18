
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoachWithFinancials } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePayoutsFromPending } from "@/services/coach-finance-service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PayoutsTableProps {
    coachesWithPending: CoachWithFinancials[];
    isLoading: boolean;
    onDataChange: () => void;
}

export default function PayoutsTable({ coachesWithPending, isLoading, onDataChange }: PayoutsTableProps) {
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleProcessPayout = async (coachId: string, amount: number) => {
        setProcessingId(coachId);
        const result = await generatePayoutsFromPending(coachId, amount);
        if (result.success) {
            toast({ title: "Payout Processed", description: `A payout of DZD ${amount.toFixed(2)} has been recorded.` });
            onDataChange();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setProcessingId(null);
    };

    const renderSkeleton = () => Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
        </TableRow>
    ));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Payouts</CardTitle>
                <CardDescription>A list of coaches with outstanding balances to be paid.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Coach</TableHead>
                            <TableHead>Commission</TableHead>
                            <TableHead>Amount Owed</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? renderSkeleton() : coachesWithPending.map(coach => (
                            <TableRow key={coach.id}>
                                <TableCell className="font-medium">{coach.name}</TableCell>
                                <TableCell>{coach.commissionRate || 70}%</TableCell>
                                <TableCell className="font-semibold text-primary">DZD {coach.pendingPayout?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleProcessPayout(coach.id, coach.pendingPayout || 0)}
                                        disabled={processingId === coach.id}
                                    >
                                        {processingId === coach.id ? "Processing..." : "Process Payout"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && coachesWithPending.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No pending payouts at the moment.</p>
                )}
            </CardContent>
        </Card>
    );
}
