
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/admin-service";
import { DollarSign, ShoppingCart, Users, Activity, Mail, UserPlus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

// Define a type for the stats to avoid using 'any'
type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [appSearchTerm, setAppSearchTerm] = useState('');

    useEffect(() => {
        async function loadStats() {
            setLoading(true);
            const fetchedStats = await getDashboardStats();
            setStats(fetchedStats);
            setLoading(false);
        }
        loadStats();
    }, []);

    const filteredRecentOrders = useMemo(() => {
        if (!stats) return [];
        if (!orderSearchTerm) return stats.recentOrders;
        return stats.recentOrders.filter(order =>
            order.customer.name.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(orderSearchTerm.toLowerCase())
        );
    }, [stats, orderSearchTerm]);

    const filteredRecentApplications = useMemo(() => {
        if (!stats) return [];
        if (!appSearchTerm) return stats.recentApplications;
        return stats.recentApplications.filter(app =>
            app.applicant.name.toLowerCase().includes(appSearchTerm.toLowerCase())
        );
    }, [stats, appSearchTerm]);


    const getStatusVariant = (status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled') => {
        switch (status) {
            case 'delivered': return 'default';
            case 'pending': return 'secondary';
            case 'shipped': return 'outline';
            case 'processing': return 'destructive';
            case 'canceled': return 'destructive';
            default: return 'secondary';
        }
    }
    
    const getApplicationStatusVariant = (status: 'new' | 'contacted' | 'active' | 'rejected' | 'archived') => {
        switch (status) {
            case 'new': return 'default';
            case 'contacted': return 'secondary';
            case 'active': return 'default';
            default: return 'outline';
        }
    }

    const getRecentOrdersDescription = () => {
        if (!stats) return "";
        const count = stats.recentOrders.length;
        if (count === 1) return "Your most recent order.";
        if (count > 1 && count < 5) return `Your ${count} most recent orders.`;
        return "Your 5 most recent orders.";
    }
    
    const getRecentApplicationsDescription = () => {
        if (!stats) return "";
        const count = stats.recentApplications.length;
        if (count === 1) return "Your most recent coaching application.";
        if (count > 1 && count < 5) return `Your ${count} most recent applications.`;
        return "Your 5 most recent applications.";
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <div className="grid gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }
    
    if (!stats) {
        return <p>Could not load dashboard data.</p>
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-bold font-headline tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">An overview of your store's performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="border-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.unreadMessages}</div>
                        <p className="text-xs text-muted-foreground">From contact form</p>
                    </CardContent>
                </Card>
                 <Card className="border-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Applications</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.newApplications}</div>
                        <p className="text-xs text-muted-foreground">New coaching applicants</p>
                    </CardContent>
                </Card>
                <Card className="border-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex-1">Total Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground">Total orders placed</p>
                    </CardContent>
                </Card>
                <Card className="border-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex-1">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.newCustomersThisMonth}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                <Card className="border-primary">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>{getRecentOrdersDescription()}</CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-8 sm:w-[240px]"
                                    value={orderSearchTerm}
                                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(order.date), "PPP")}
                                        </TableCell>
                                        <TableCell className="text-right">DZD {order.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredRecentOrders.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                {orderSearchTerm ? `No orders found for "${orderSearchTerm}"` : "No orders have been placed yet."}
                            </p>
                        )}
                    </CardContent>
                    {stats.recentOrders.length > 0 && (
                        <div className="flex items-center justify-center p-4">
                            <Button asChild variant="outline">
                                <Link href="/admin/orders">View All Orders</Link>
                            </Button>
                        </div>
                    )}
                </Card>

                <Card className="border-primary">
                    <CardHeader>
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle>Recent Coaching Applications</CardTitle>
                                <CardDescription>{getRecentApplicationsDescription()}</CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by applicant..."
                                    className="pl-8 sm:w-[240px]"
                                    value={appSearchTerm}
                                    onChange={(e) => setAppSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Coach</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecentApplications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="font-medium">{app.applicant.name}</div>
                                            <div className="text-sm text-muted-foreground">{app.planTitle}</div>
                                        </TableCell>
                                        <TableCell>
                                            {app.coachName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getApplicationStatusVariant(app.status)}>{app.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredRecentApplications.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                 {appSearchTerm ? `No applications found for "${appSearchTerm}"` : "No coaching applications yet."}
                            </p>
                        )}
                    </CardContent>
                    {stats.recentApplications.length > 0 && (
                        <div className="flex items-center justify-center p-4">
                            <Button asChild variant="outline">
                                <Link href="/admin/coaches">View All Applications</Link>
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

    