
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
import type { Order } from "@/types"
import { format } from "date-fns"
import Image from "next/image"

interface ViewOrderDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    order: Order;
}

export default function ViewOrderDialog({ isOpen, onOpenChange, order }: ViewOrderDialogProps) {
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order ID: {order.id}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Customer Information</h3>
                        <p className="text-sm">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Shipping Address</h3>
                        <p className="text-sm">{order.shippingAddress.address}</p>
                        <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <h3 className="font-semibold">Order Date</h3>
                        <p className="text-sm">{format(new Date(order.date), "PPP p")}</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Status</h3>
                        <Badge className="text-xs" variant={getStatusVariant(order.status)}>
                            {order.status}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Total Amount</h3>
                        <p className="text-sm font-bold">DZD {order.amount.toFixed(2)}</p>
                    </div>
                </div>

                {order.promoCode && (
                     <>
                        <Separator />
                        <div className="space-y-1">
                            <h3 className="font-semibold">Promotion Applied</h3>
                            <p className="text-sm">Code: <span className="font-mono bg-muted p-1 rounded-md">{order.promoCode.code}</span></p>
                            <p className="text-sm text-green-600">Discount: -DZD {order.promoCode.discountAmount.toFixed(2)}</p>
                        </div>
                     </>
                )}


                <Separator />

                <div>
                    <h3 className="font-semibold mb-4">Items Ordered</h3>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.product.id} className="flex items-start gap-4">
                                <Image 
                                    src={item.product.imageUrl} 
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md object-cover"
                                />
                                <div className="flex-grow">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Qty: {item.quantity} x DZD {item.product.price.toFixed(2)}
                                    </p>
                                    {(item.selectedFlavor || item.selectedSize || item.selectedColor) && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.selectedFlavor && `Flavor: ${item.selectedFlavor}`}
                                            {item.selectedSize && ` / Size: ${item.selectedSize}`}
                                            {item.selectedColor && ` / Color: ${item.selectedColor}`}
                                        </p>
                                    )}
                                </div>
                                <p className="font-medium text-sm">
                                    DZD {(item.product.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
