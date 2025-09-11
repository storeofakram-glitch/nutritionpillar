
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Order, Customer } from "@/types"
import { format } from "date-fns"

interface ViewCustomerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    customer: Customer & { phone?: string };
    orders: Order[];
}

export default function ViewCustomerDialog({ isOpen, onOpenChange, customer, orders }: ViewCustomerDialogProps) {
    
    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);

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
    
    // Use the phone number passed in the customer prop if available, otherwise get it from the latest order.
    const phone = customer.phone || (orders.length > 0 ? orders[0].shippingAddress.phone : "Not available");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            {customer.name} - {customer.email}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <h3 className="font-semibold text-base">Contact Information</h3>
                        <p>{customer.name}</p>
                        <p className="text-muted-foreground">{customer.email}</p>
                        <p className="text-muted-foreground">Phone: {phone}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-base">Order History</h3>
                        <p>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</p>
                        <p className="text-muted-foreground">
                            Total Spent: <span className="font-bold text-foreground">DZD {totalSpent.toFixed(2)}</span>
                        </p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-base">Last Order Address</h3>
                        {orders.length > 0 ? (
                             <p className="text-muted-foreground">
                                {orders[0].shippingAddress.address}, {orders[0].shippingAddress.city}, {orders[0].shippingAddress.state}
                             </p>
                        ) : <p className="text-muted-foreground">No orders yet</p>}
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="font-semibold text-base mb-4">All Orders</h3>
                    {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order N°</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">{String(order.orderNumber).padStart(6, '0')}</TableCell>
                                        <TableCell className="font-mono text-xs">{order.id.substring(0, 6).toUpperCase()}</TableCell>
                                        <TableCell>{format(new Date(order.date), "PPP")}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">DZD {order.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">This customer has not placed any orders yet.</p>
                    )}
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
