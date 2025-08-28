import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CartItems from "@/components/cart-items";
import CheckoutForm from "@/components/checkout-form";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-2">
            <CartItems />
        </div>
        <div className="lg:col-span-1 sticky top-20">
            <CheckoutForm />
        </div>
      </div>
    </div>
  );
}
