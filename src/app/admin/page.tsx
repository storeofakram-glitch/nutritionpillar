
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/admin-service";
import { DollarSign, ShoppingCart, Users, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

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

    const getRecentOrdersDescription = () => {
        const count = stats.recentOrders.length;
        if (count === 1) {
            return "Your most recent order.";
        }
        if (count > 1 && count < 5) {
            return `Your ${count} most recent orders.`;
        }
        return "Your 5 most recent orders.";
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-bold font-headline tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">An overview of your store's performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex-1">Total Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground">Total orders placed</p>
                    </CardContent>
                </Card>
                <Card>
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

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>{getRecentOrdersDescription()}</CardDescription>
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
                            {stats.recentOrders.map(order => (
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
                     {stats.recentOrders.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No orders have been placed yet.</p>
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
        </div>
    )
}
