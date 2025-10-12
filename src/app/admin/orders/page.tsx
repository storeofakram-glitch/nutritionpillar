
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
import { MoreHorizontal, RefreshCw, Search } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useTransition, useMemo } from "react";
import type { Customer, Order } from "@/types";
import { getOrders, updateOrderStatus } from "@/services/order-service";
import { getCustomerOrders } from "@/services/admin-service";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import ViewOrderDialog from "./_components/view-order-dialog";
import ViewCustomerDialog from "../customers/_components/view-customer-dialog";
import DeleteOrderDialog from "./_components/delete-order-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const orderStatuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];

export default function AdminOrdersPage({ authLoading }: { authLoading?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


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

  const filteredOrders = useMemo(() => {
    if (!searchTerm) {
        return orders;
    }
    return orders.filter(order => 
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.phone.includes(searchTerm) ||
        String(order.orderNumber).padStart(6, '0').includes(searchTerm)
    );
  }, [orders, searchTerm]);


  const customersWithCanceledOrders = useMemo(() => {
    const customerPhones = new Set<string>();
    orders.forEach(order => {
        if (order.status === 'canceled') {
            customerPhones.add(order.shippingAddress.phone);
        }
    });
    return customerPhones;
  }, [orders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOrderOpen(true);
  }

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  }

  const onDialogClose = () => {
    setIsViewOrderOpen(false);
    setIsViewCustomerOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedOrder(null);
    fetchOrders();
  };

  const handleViewCustomer = async (customer: Customer) => {
    const tempOrder = orders.find(o => o.customer.email === customer.email) || { customer } as Order;
    setSelectedOrder(tempOrder); 
    const customerOrders = await getCustomerOrders(customer.email);
    setCustomerOrders(customerOrders);
    setIsViewCustomerOpen(true);
  }

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    const result = await updateOrderStatus(orderId, status);
    if (result.success) {
        toast({
            title: "Status Updated",
            description: `Order status has been updated to "${status}".`,
        });
        fetchOrders();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update order status.",
        });
    }
  }

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'delivered': return 'default';
        case 'pending': return 'secondary';
        case 'shipped': return 'outline';
        case 'processing': return 'destructive';
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
      <Card className="border-primary">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                A list of all the orders in your store.
              </CardDescription>
            </div>
             <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8 sm:w-[200px] lg:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isPending || authLoading}>
                  <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
            </div>
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
              {loading || authLoading ? renderSkeleton() : filteredOrders.map(order => (
                  <TableRow 
                    key={order.id}
                    className={cn(
                        customersWithCanceledOrders.has(order.shippingAddress.phone) && 'bg-red-50/50 hover:bg-red-50/80 dark:bg-red-950/50 dark:hover:bg-red-950/80'
                    )}
                  >
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
                                  <Button size="icon" variant="ghost" disabled={authLoading}>
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => handleViewOrder(order)}>View Order</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleViewCustomer(order.customer)}>View Customer</DropdownMenuItem>
                                  <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        {orderStatuses.map(status => (
                                            <DropdownMenuItem 
                                                key={status}
                                                onSelect={() => handleStatusChange(order.id, status)}
                                                disabled={order.status === status}
                                            >
                                                {status}
                                            </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => handleDeleteOrder(order)} className="text-red-600">
                                      Delete Order
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
               {!loading && filteredOrders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm ? `No orders found for "${searchTerm}".` : "No orders found."}
                    </TableCell>
                </TableRow>
            )}
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
            <DeleteOrderDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                order={selectedOrder}
                onDialogClose={onDialogClose}
            />
        </>
      )}
    </>
  )
}

    