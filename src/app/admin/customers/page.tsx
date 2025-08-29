
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useTransition } from "react";
import { getCustomerOrders, getCustomers } from "@/services/admin-service";
import type { Order, Customer } from "@/types";
import ViewCustomerDialog from "./_components/view-customer-dialog";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const fetchAndProcessData = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const fetchedCustomers = await getCustomers();
                setCustomers(fetchedCustomers);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        });
    }

    useEffect(() => {
        fetchAndProcessData();
    }, []);

    const handleViewCustomer = async (customer: Customer) => {
        setSelectedCustomer(customer);
        const orders = await getCustomerOrders(customer.email);
        setCustomerOrders(orders);
        setIsViewCustomerOpen(true);
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle>Customers</CardTitle>
                            <CardDescription>View and manage your customers.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchAndProcessData} disabled={isPending}>
                           <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                           <span className="sr-only">Refresh</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map(customer => (
                                <TableRow key={customer.email}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => handleViewCustomer(customer)}>View Details</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleViewCustomer(customer)}>View Orders</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedCustomer && (
                 <ViewCustomerDialog
                    isOpen={isViewCustomerOpen}
                    onOpenChange={setIsViewCustomerOpen}
                    customer={selectedCustomer}
                    orders={customerOrders}
                />
            )}
        </>
    )
}
