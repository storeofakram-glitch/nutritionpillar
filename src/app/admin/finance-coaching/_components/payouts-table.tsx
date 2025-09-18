
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoachPayout, Coach } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { processPayout } from "@/services/coach-finance-service";
import { useToast } from "@/hooks/use-toast";

interface PayoutsTableProps {
    payouts: CoachPayout[];
    coaches: Coach[];
    isLoading: boolean;
    onDataChange: () => void;
}

export default function PayoutsTable({ payouts, coaches, isLoading, onDataChange }: PayoutsTableProps) {
    const { toast } = useToast();
    const coachMap = new Map(coaches.map(c => [c.id, c.name]));

    const handleProcess = async (payoutId: string) => {
        const result = await processPayout(payoutId);
        if (result.success) {
            toast({ title: "Payout Processed", description: "Payout marked as completed and records updated." });
            onDataChange();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    const renderSkeleton = () => Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
        </TableRow>
    ));
    
    const getStatusVariant = (status: CoachPayout['status']) => {
        switch (status) {
            case 'completed': return 'default';
            case 'pending': return 'secondary';
            case 'failed': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Coach Payouts</CardTitle>
                <CardDescription>View and process payouts for your coaching staff.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Coach</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? renderSkeleton() : payouts.map(payout => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-medium">{coachMap.get(payout.coachId) || 'Unknown Coach'}</TableCell>
                                <TableCell>DZD {payout.amount.toFixed(2)}</TableCell>
                                <TableCell>{format(new Date(payout.payoutDate), "PPP")}</TableCell>
                                <TableCell><Badge variant={getStatusVariant(payout.status)}>{payout.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {payout.status === 'pending' && (
                                        <Button size="sm" onClick={() => handleProcess(payout.id)}>Mark as Paid</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && payouts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No payouts recorded yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
