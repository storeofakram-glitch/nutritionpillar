
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CoachWithFinancials } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { processAllPendingPayoutsForCoach } from "@/services/coach-finance-service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PayoutsTableProps {
    coachesWithPending: CoachWithFinancials[];
    isLoading: boolean;
    onDataChange: () => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

export default function PayoutsTable({ coachesWithPending, isLoading, onDataChange, searchTerm, onSearchTermChange }: PayoutsTableProps) {
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleProcessPayout = async (coachId: string, amount: number) => {
        setProcessingId(coachId);
        const result = await processAllPendingPayoutsForCoach(coachId);
        if (result.success) {
            toast({ title: "Payout Processed", description: `A payout of DZD ${amount.toFixed(2)} has been recorded for the coach.` });
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
        <Card className="border-primary">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Pending Payouts</CardTitle>
                        <CardDescription>A list of coaches with outstanding balances to be paid.</CardDescription>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by coach name..."
                            className="pl-8 sm:w-[240px]"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="max-h-[750px]">
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
                </ScrollArea>
                {!isLoading && coachesWithPending.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No pending payouts at the moment.</p>
                )}
            </CardContent>
        </Card>
    );
}
