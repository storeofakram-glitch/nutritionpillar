
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CoachWithFinancials } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import EditCommissionDialog from "./edit-commission-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommissionTableProps {
    coaches: CoachWithFinancials[];
    isLoading: boolean;
    onDataChange: () => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

export default function CommissionTable({ coaches, isLoading, onDataChange, searchTerm, onSearchTermChange }: CommissionTableProps) {
    const [selectedCoach, setSelectedCoach] = useState<CoachWithFinancials | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEdit = (coach: CoachWithFinancials) => {
        setSelectedCoach(coach);
        setIsEditOpen(true);
    };

    const handleDialogClose = () => {
        setIsEditOpen(false);
        setSelectedCoach(null);
        onDataChange();
    };
    
    const renderSkeleton = () => Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
    ));

    return (
        <>
            <Card className="border-primary">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle>Coach Commissions</CardTitle>
                            <CardDescription>Manage commission rates and view financial summaries for your team.</CardDescription>
                        </div>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name..."
                                className="pl-8 sm:w-[240px]"
                                value={searchTerm}
                                onChange={(e) => onSearchTermChange(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[500px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Coach</TableHead>
                                    <TableHead>Commission</TableHead>
                                    <TableHead>Pending Payout</TableHead>
                                    <TableHead>Total Paid</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? renderSkeleton() : coaches.map(coach => (
                                    <TableRow key={coach.id}>
                                        <TableCell className="font-medium">{coach.name}</TableCell>
                                        <TableCell>{coach.commissionRate || 70}%</TableCell>
                                        <TableCell className="font-semibold text-primary">DZD {coach.pendingPayout?.toFixed(2) || '0.00'}</TableCell>
                                        <TableCell>DZD {coach.paidOut?.toFixed(2) || '0.00'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleEdit(coach)}>Edit Rate</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && coaches.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No coaches found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
            {selectedCoach && (
                <EditCommissionDialog
                    isOpen={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    coach={selectedCoach}
                    onDialogClose={handleDialogClose}
                />
            )}
        </>
    );
}
