
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Coach, CoachPayout } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PayoutsHistoryTableProps {
    payouts: CoachPayout[];
    coaches: Coach[];
    isLoading: boolean;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    onDataChange: () => void;
}

export default function PayoutsHistoryTable({ payouts, coaches, isLoading, searchTerm, onSearchTermChange }: PayoutsHistoryTableProps) {
    const coachMap = new Map(coaches.map(c => [c.id, c.name]));

    const renderSkeleton = () => Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
        <Card className="border-primary">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Payout History</CardTitle>
                        <CardDescription>A log of all past payouts made to coaches.</CardDescription>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by coach..."
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
                                <TableHead>Client</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? renderSkeleton() : payouts.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell className="font-medium">{coachMap.get(payout.coachId) || payout.coachId}</TableCell>
                                    <TableCell>{payout.clientName}</TableCell>
                                    <TableCell>{payout.planTitle}</TableCell>
                                    <TableCell>DZD {payout.amount.toFixed(2)}</TableCell>
                                    <TableCell>{format(new Date(payout.payoutDate), "PPP")}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(payout.status)}>{payout.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                 {!isLoading && payouts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No payout history found.</p>
                )}
            </CardContent>
        </Card>
    );
}
