
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartItems() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardHeader>
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-2xl font-headline">Shopping Cart</CardTitle>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Continue Shopping
                </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={clearCart} disabled={cartItems.length === 0}>
                Clear Cart
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {cartItems.map(item => (
            <div key={item.product.id} className="flex items-center gap-4 py-4">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
              <div className="flex-grow">
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.selectedFlavor && `Flavor: ${item.selectedFlavor}`}
                  {item.selectedSize && ` / Size: ${item.selectedSize}`}
                </p>
                <p className="text-sm font-bold text-primary">DZD {item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                  className="w-20 h-9"
                />
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
