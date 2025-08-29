"use client";

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { promoCodes } from '@/lib/mock-data';
import type { City, ShippingState } from '@/types';
import { getShippingOptions } from '@/services/shipping-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CheckoutForm() {
  const { cartTotal, cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [shippingOptions, setShippingOptions] = useState<ShippingState[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  
  const [clientInfo, setClientInfo] = useState({ fullName: '', phone: '', address: '' });

  useEffect(() => {
    async function fetchOptions() {
      const options = await getShippingOptions();
      setShippingOptions(options);
    }
    fetchOptions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setClientInfo(prev => ({ ...prev, [id]: value }));
  };

  const availableCities: City[] = useMemo(() => {
    return shippingOptions.find(s => s.state === selectedState)?.cities || [];
  }, [selectedState, shippingOptions]);

  const shippingPrice = useMemo(() => {
    return availableCities.find(c => c.name === selectedCity)?.price || 0;
  }, [selectedCity, availableCities]);

  const handleApplyPromoCode = () => {
    const code = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase() && !p.used);
    if (code) {
      let discountAmount = 0;
      if (code.type === 'percentage') {
        discountAmount = cartTotal * (code.discount / 100);
      } else {
        discountAmount = code.discount;
      }
      setAppliedPromo({ code: code.code, discountAmount });
      toast({ title: 'Success', description: `Promo code "${code.code}" applied.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid or used promo code.' });
      setAppliedPromo(null);
    }
  };

  const subtotal = cartTotal;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const total = subtotal - discountAmount + shippingPrice;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Your cart is empty.' });
        return;
    }
    if (!clientInfo.fullName || !clientInfo.phone || !clientInfo.address || !selectedState || !selectedCity) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
        return;
    }

    const orderData = { ...clientInfo, state: selectedState, city: selectedCity, shippingPrice, products: cartItems, subtotal, promoCode: appliedPromo, total, status: 'pending' };
    
    console.log('Order Submitted:', orderData);
    
    toast({ title: 'Order Placed!', description: 'Thank you for your purchase.' });
    clearCart();
    router.push('/');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          {/* Shipping Section */}
          <div className="space-y-2">
            <h3 className="font-semibold">Shipping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State (Wilaya)</Label>
                <Select onValueChange={setSelectedState} value={selectedState}>
                  <SelectTrigger id="state"><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Select onValueChange={setSelectedCity} value={selectedCity} disabled={!selectedState}>
                  <SelectTrigger id="city"><SelectValue placeholder="Select City" /></SelectTrigger>
                  <SelectContent>
                    {availableCities.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Client Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold">Your Information</h3>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={clientInfo.fullName} onChange={handleInputChange} placeholder="John Doe" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={clientInfo.phone} onChange={handleInputChange} placeholder="0555 123 456" required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={clientInfo.address} onChange={handleInputChange} placeholder="123 Main St, Apt 4B" required />
            </div>
          </div>
          
          {/* Promo Code Section */}
          <div className="space-y-2">
            <Label htmlFor="promo">Promo Code</Label>
            <div className="flex gap-2">
              <Input id="promo" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="e.g. SAVE10" />
              <Button type="button" variant="outline" onClick={handleApplyPromoCode}>Apply</Button>
            </div>
          </div>

          <Separator />

          {/* Order Totals Section */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>DZD {subtotal.toFixed(2)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-DZD {discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>DZD {shippingPrice.toFixed(2)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>DZD {total.toFixed(2)}</span></div>
          </div>

          <Button type="submit" className="w-full font-bold" size="lg" disabled={cartItems.length === 0}>Place Order</Button>
        </form>
      </CardContent>
    </Card>
  );
}
