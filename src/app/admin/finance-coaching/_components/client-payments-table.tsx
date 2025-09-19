
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClientPayment, Coach } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClientPaymentsTableProps {
    clients: ClientPayment[];
    coaches: Coach[];
    isLoading: boolean;
    onDataChange: () => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

export default function ClientPaymentsTable({ clients, coaches, isLoading, onDataChange, searchTerm, onSearchTermChange }: ClientPaymentsTableProps) {

    const renderSkeleton = () => Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        </TableRow>
    ));

    const getStatusVariant = (status: ClientPayment['status']) => {
        switch (status) {
            case 'paid': return 'default';
            case 'pending': return 'secondary';
            case 'overdue': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Client Payments</CardTitle>
                        <CardDescription>Track payments received from coaching clients.</CardDescription>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by client or coach..."
                            className="pl-8 sm:w-[240px]"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Coach</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? renderSkeleton() : clients.map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.clientName}</TableCell>
                                <TableCell>{client.coachName}</TableCell>
                                <TableCell>{client.planTitle}</TableCell>
                                <TableCell>DZD {client.amount.toFixed(2)}</TableCell>
                                <TableCell><Badge variant={getStatusVariant(client.status)}>{client.status}</Badge></TableCell>
                                <TableCell>{format(new Date(client.paymentDate), "PPP")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {!isLoading && clients.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No client payments found.</p>
                )}
            </CardContent>
        </Card>
    );
}
