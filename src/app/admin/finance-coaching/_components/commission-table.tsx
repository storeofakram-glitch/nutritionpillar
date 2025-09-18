
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CoachWithFinancials } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import EditCommissionDialog from "./edit-commission-dialog";

interface CommissionTableProps {
    coaches: CoachWithFinancials[];
    isLoading: boolean;
    onDataChange: () => void;
}

export default function CommissionTable({ coaches, isLoading, onDataChange }: CommissionTableProps) {
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
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
    ));

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Coach Commissions</CardTitle>
                    <CardDescription>Manage commission rates for your coaches and experts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coach</TableHead>
                                <TableHead>Commission Rate</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? renderSkeleton() : coaches.map(coach => (
                                <TableRow key={coach.id}>
                                    <TableCell className="font-medium">{coach.name}</TableCell>
                                    <TableCell>{coach.commissionRate || 70}%</TableCell>
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
                        </TableBody>
                    </Table>
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
