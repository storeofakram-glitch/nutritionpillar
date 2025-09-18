
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Coach, CoachPayout } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface PayoutsHistoryTableProps {
    payouts: CoachPayout[];
    coaches: Coach[];
    isLoading: boolean;
}

export default function PayoutsHistoryTable({ payouts, coaches, isLoading }: PayoutsHistoryTableProps) {
    const coachMap = new Map(coaches.map(c => [c.id, c.name]));

    const renderSkeleton = () => Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
                <CardTitle>Payout History</CardTitle>
                <CardDescription>A log of all past payouts made to coaches.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Coach</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? renderSkeleton() : payouts.map(payout => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-medium">{coachMap.get(payout.coachId) || payout.coachId}</TableCell>
                                <TableCell>DZD {payout.amount.toFixed(2)}</TableCell>
                                <TableCell>{format(new Date(payout.payoutDate), "PPP")}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(payout.status)}>{payout.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {!isLoading && payouts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No payout history found.</p>
                )}
            </CardContent>
        </Card>
    );
}
