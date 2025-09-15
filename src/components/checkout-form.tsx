
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import type { City, ShippingState, OrderInput, PaymentMethod, SiteSettings, TermsPageSettings, DeliveryMethod } from '@/types';
import { getShippingOptions } from '@/services/shipping-service';
import { getSiteSettings } from '@/services/site-settings-service';
import { addOrder } from '@/services/order-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CreditCard, Home, Briefcase } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from './ui/scroll-area';
import { dzStates } from '@/lib/dz-states';

export default function CheckoutForm() {
  const { cartTotal, cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [shippingOptions, setShippingOptions] = useState<ShippingState[]>([]);
  const [termsContent, setTermsContent] = useState<TermsPageSettings | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Home Delivery');
  
  const [clientInfo, setClientInfo] = useState({ fullName: '', phone: '', address: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pay on Delivery');
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [shippingData, settingsData] = await Promise.all([
        getShippingOptions(),
        getSiteSettings()
      ]);
      setShippingOptions(shippingData);
      if (settingsData?.termsPage) {
        setTermsContent(settingsData.termsPage);
      }
    }
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setClientInfo(prev => ({ ...prev, [id]: value }));
  };
  
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCardInfo(prev => ({ ...prev, [id]: value }));
  };

  const selectedStateData = useMemo(() => {
    return shippingOptions.find(s => s.state === selectedState);
  }, [selectedState, shippingOptions]);

  const availableCities = useMemo(() => {
    const state = dzStates.find(s => s.name === selectedState);
    return state ? state.cities : [];
  }, [selectedState]);


  const shippingPrice = useMemo(() => {
    const cityOverride = selectedStateData?.cities.find(c => c.name === selectedCity);
    if (cityOverride) {
        return deliveryMethod === 'Home Delivery' ? cityOverride.homeDeliveryPrice : cityOverride.officeDeliveryPrice;
    }
    return deliveryMethod === 'Home Delivery' ? selectedStateData?.defaultHomeDeliveryPrice ?? 0 : selectedStateData?.defaultOfficeDeliveryPrice ?? 0;
  }, [selectedCity, selectedStateData, deliveryMethod]);


  const subtotal = cartTotal;
  const total = subtotal + shippingPrice;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Your cart is empty.' });
        return;
    }
    if (!clientInfo.fullName || !clientInfo.phone || !clientInfo.address || !clientInfo.email || !selectedState || !selectedCity) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
        return;
    }
    if (paymentMethod !== 'Pay on Delivery' && (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvv)) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all card details.' });
        return;
    }
     if (!agreedToTerms) {
        toast({ variant: 'destructive', title: 'Agreement Required', description: 'You must agree to the terms and conditions.' });
        return;
    }
    
    setIsSubmitting(true);

    const orderData: OrderInput = {
        customer: { name: clientInfo.fullName, email: clientInfo.email },
        shippingAddress: { 
            address: clientInfo.address, 
            city: selectedCity, 
            state: selectedState, 
            phone: clientInfo.phone 
        },
        items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            selectedFlavor: item.selectedFlavor,
        })),
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
    };
    
    const result = await addOrder(orderData);

    setIsSubmitting(false);

    if (result.success) {
        toast({ title: "Order Placed Successfully!", description: "Thank you for your purchase. We will contact you soon." });
        clearCart();
        router.push('/');
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'There was a problem placing your order. Please try again.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          
          <div className="space-y-2">
            <h3 className="font-semibold">Your Information</h3>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={clientInfo.fullName} onChange={handleInputChange} placeholder="Enter your full name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={clientInfo.email} onChange={handleInputChange} placeholder="Enter your email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={clientInfo.phone} onChange={handleInputChange} placeholder="Enter your phone number" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Shipping</h3>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={clientInfo.address} onChange={handleInputChange} placeholder="Your street address" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State (Wilaya)</Label>
                <Select onValueChange={setSelectedState} value={selectedState}>
                  <SelectTrigger id="state"><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map(s => <SelectItem key={s.id} value={s.state}>{s.state}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Select onValueChange={setSelectedCity} value={selectedCity} disabled={!selectedState}>
                  <SelectTrigger id="city"><SelectValue placeholder="Select City" /></SelectTrigger>
                  <SelectContent>
                    {availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
           
          <div className="space-y-4">
             <h3 className="font-semibold">Delivery Method</h3>
             <RadioGroup value={deliveryMethod} onValueChange={(val) => setDeliveryMethod(val as DeliveryMethod)} className="grid grid-cols-1 gap-4">
                <Label htmlFor="home-delivery" className="flex items-center gap-3 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value="Home Delivery" id="home-delivery" />
                    <Home className="h-5 w-5" />
                    <span>Home Delivery</span>
                </Label>
                 <Label htmlFor="office-delivery" className="flex items-center gap-3 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value="Desk (Office) Delivery" id="office-delivery" />
                    <Briefcase className="h-5 w-5" />
                    <span>Desk (Office) Delivery</span>
                </Label>
             </RadioGroup>
          </div>

          <div className="space-y-4">
             <h3 className="font-semibold">Payment Method</h3>
             <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)} className="grid grid-cols-1 gap-4">
                <Label htmlFor="pay-on-delivery" className="flex items-center gap-3 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value="Pay on Delivery" id="pay-on-delivery" />
                    <span>Pay on Delivery</span>
                </Label>
                 <Label htmlFor="cib-card" className="flex items-center justify-between gap-3 rounded-md border p-4 cursor-not-allowed opacity-50">
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="CIB / EDAHABIA Card" id="cib-card" disabled />
                        <span>(CIB / EDAHABIA) Card</span>
                    </div>
                    <span className="text-xs font-semibold text-primary">Coming Soon</span>
                </Label>
                <Label htmlFor="visa-mastercard" className="flex items-center justify-between gap-3 rounded-md border p-4 cursor-not-allowed opacity-50">
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="Visa / Mastercard" id="visa-mastercard" disabled />
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span>Visa / Mastercard</span>
                    </div>
                    <span className="text-xs font-semibold text-primary">Coming Soon</span>
                </Label>
             </RadioGroup>
          </div>

          {paymentMethod === 'Credit / Debit Card' && (
            <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Payment Details</h3>
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="number" value={cardInfo.number} onChange={handleCardInputChange} placeholder="•••• •••• •••• ••••" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input id="name" value={cardInfo.name} onChange={handleCardInputChange} placeholder="Name on card" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                        <Input id="expiry" value={cardInfo.expiry} onChange={handleCardInputChange} placeholder="MM/YY" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cvv">CVV2</Label>
                        <Input id="cvv" value={cardInfo.cvv} onChange={handleCardInputChange} placeholder="CVV" required />
                    </div>
                </div>
            </div>
          )}


          {/* Order Totals Section */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>DZD {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>DZD {shippingPrice.toFixed(2)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>DZD {total.toFixed(2)}</span></div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                        I agree to the terms and conditions.
                    </Label>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" type="button" className="p-0 h-auto text-sm text-primary underline-offset-4 hover:underline">Read Terms</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{termsContent?.title || "Terms of Service"}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                                <div className="prose prose-sm dark:prose-invert p-1">
                                    {termsContent ? (
                                        <ReactMarkdown>{termsContent.content}</ReactMarkdown>
                                    ) : (
                                        <p>Loading terms...</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Button type="submit" className="w-full font-bold" size="lg" disabled={cartItems.length === 0 || isSubmitting || !agreedToTerms}>
                {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

    