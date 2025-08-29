
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useTransition } from "react";
import type { Customer, Order } from "@/types";
import { getOrders } from "@/services/order-service";
import { getCustomerOrders } from "@/services/admin-service";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import ViewOrderDialog from "./_components/view-order-dialog";
import ViewCustomerDialog from "../customers/_components/view-customer-dialog";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOrderOpen(true);
  }

  const handleViewCustomer = async (customer: Customer) => {
    // A bit of a hack to pass customer data, but it's fine for the dialog
    const tempOrder = orders.find(o => o.customer.email === customer.email) || { customer } as Order;
    setSelectedOrder(tempOrder); 
    const customerOrders = await getCustomerOrders(customer.email);
    setCustomerOrders(customerOrders);
    setIsViewCustomerOpen(true);
  }

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'delivered': return 'default';
        case 'pending': return 'secondary';
        case 'shipped': return 'outline';
        case 'processing': return 'destructive'; // No direct mapping, using destructive for visibility
        case 'canceled': return 'destructive';
        default: return 'secondary';
    }
  }

  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell className="text-right"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                A list of all the orders in your store.
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isPending}>
              <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? renderSkeleton() : orders.map(order => (
                  <TableRow key={order.id}>
                       <TableCell className="font-mono text-xs">
                          #{String(order.orderNumber).padStart(6, '0')}
                      </TableCell>
                      <TableCell>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                              {order.customer.email}
                          </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant={getStatusVariant(order.status)}>
                              {order.status}
                          </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                          {format(new Date(order.date), "PPP")}
                      </TableCell>
                      <TableCell className="text-right">DZD {order.amount.toFixed(2)}</TableCell>
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
                                  <DropdownMenuItem onSelect={() => handleViewOrder(order)}>View Order</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleViewCustomer(order.customer)}>View Customer</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <>
            <ViewOrderDialog
                isOpen={isViewOrderOpen}
                onOpenChange={setIsViewOrderOpen}
                order={selectedOrder}
            />
            <ViewCustomerDialog
                isOpen={isViewCustomerOpen}
                onOpenChange={setIsViewCustomerOpen}
                customer={selectedOrder.customer}
                orders={customerOrders}
            />
        </>
      )}
    </>
  )
}
