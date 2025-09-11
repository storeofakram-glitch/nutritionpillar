
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
import { MoreHorizontal, RefreshCw, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useTransition, useMemo } from "react";
import { getCustomerOrders } from "@/services/admin-service";
import { getOrders } from "@/services/order-service";
import type { Order, Customer } from "@/types";
import ViewCustomerDialog from "./_components/view-customer-dialog";

export default function AdminCustomersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const fetchAndProcessData = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const fetchedOrders = await getOrders();
                setOrders(fetchedOrders);
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
    
    const allUniqueCustomers = useMemo(() => {
        const customerMap = new Map<string, Customer>();
        orders.forEach(order => {
            if (!customerMap.has(order.customer.email)) {
                customerMap.set(order.customer.email, order.customer);
            }
        });
        return Array.from(customerMap.values());
    }, [orders]);


    const { deliveredCustomers, canceledCustomers } = useMemo(() => {
        const delivered = new Map<string, Customer>();
        const canceled = new Map<string, Customer>();
        
        orders.forEach(order => {
            // A customer is considered "valued" if they have at least one delivered order.
            if (order.status === 'delivered') {
                if (!delivered.has(order.customer.email)) {
                    delivered.set(order.customer.email, order.customer);
                }
            } 
            
            // A customer is in the "canceled" list if they have at least one canceled order.
            if (order.status === 'canceled') {
                 if (!canceled.has(order.customer.email)) {
                    canceled.set(order.customer.email, order.customer);
                }
            }
        });

        return {
            deliveredCustomers: Array.from(delivered.values()),
            canceledCustomers: Array.from(canceled.values()),
        };
    }, [orders]);

    const handleViewCustomer = async (customer: Customer) => {
        setSelectedCustomer(customer);
        const orders = await getCustomerOrders(customer.email);
        setCustomerOrders(orders);
        setIsViewCustomerOpen(true);
    }
    
    const handleDownloadCSV = () => {
        // Build a detailed customer profile
        const customerProfiles = new Map<string, { name: string; email: string; phone: string; categories: Set<string> }>();

        orders.forEach(order => {
            const email = order.customer.email;
            if (!customerProfiles.has(email)) {
                customerProfiles.set(email, {
                    name: order.customer.name,
                    email: email,
                    phone: order.shippingAddress.phone,
                    categories: new Set<string>(),
                });
            }

            const profile = customerProfiles.get(email)!;
            // Update to the latest phone number found
            profile.phone = order.shippingAddress.phone;
            
            order.items.forEach(item => {
                if (item.product.category) {
                    profile.categories.add(item.product.category);
                }
            });
        });

        const csvRows = [
            "Name,Email,Phone,Purchased Categories", // CSV header
            ...Array.from(customerProfiles.values()).map(c => {
                const name = `"${c.name.replace(/"/g, '""')}"`;
                const email = `"${c.email}"`;
                const phone = `"${c.phone}"`;
                const categories = `"${Array.from(c.categories).join(", ")}"`;
                return [name, email, phone, categories].join(",");
            })
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customer_list_with_categories.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const CustomerTable = ({ customers }: { customers: Customer[] }) => (
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
                {customers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                            No customers found in this category.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">View and manage your customers, segmented by order status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchAndProcessData} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                     <Button variant="outline" size="icon" onClick={handleDownloadCSV} disabled={allUniqueCustomers.length === 0}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download CSV</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Valued Customers (Completed Orders)</CardTitle>
                    <CardDescription>Customers who have successfully received an order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomerTable customers={deliveredCustomers} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Customers with Canceled Orders</CardTitle>
                    <CardDescription>Customers who have had an order canceled.</CardDescription>
                </CardHeader>
                <CardContent>
                     <CustomerTable customers={canceledCustomers} />
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
        </div>
    )
}
