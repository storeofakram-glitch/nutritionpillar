
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { findMembershipByCode } from '@/services/membership-service';
import type { MembershipWithProducts, Product } from '@/types';
import { CheckCircle, XCircle, Loader2, Award, ShoppingCart, CalendarClock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { differenceInDays } from 'date-fns';

export default function MembershipPage() {
    const [membershipCode, setMembershipCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MembershipWithProducts | 'invalid' | null>(null);
    const { toast } = useToast();

    const handleCheckMembership = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!membershipCode) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please enter your membership code.',
            });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const foundMembership = await findMembershipByCode(membershipCode);
            if (foundMembership) {
                setResult(foundMembership);
            } else {
                setResult('invalid');
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not verify membership.' });
            setResult('invalid');
        } finally {
            setIsLoading(false);
        }
    };
    
    const ProductRecommendationCard = ({ product }: { product: Product }) => (
      <div className="flex items-start gap-4 p-3 rounded-lg border bg-card">
          <Image 
              src={product.imageUrls[0]}
              alt={product.name}
              width={64}
              height={64}
              className="rounded-md object-cover"
          />
          <div className="flex-grow">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-primary font-bold">DZD {product.price.toFixed(2)}</p>
          </div>
          <Button size="sm" asChild>
              <Link href={`/products/${product.id}`}>View</Link>
          </Button>
      </div>
    );

    const getDaysLeft = (expiresAt?: string): number | null => {
        if (!expiresAt) return null;
        const days = differenceInDays(new Date(expiresAt), new Date());
        return Math.max(0, days);
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Membership Status</CardTitle>
                        <CardDescription className="text-lg">
                            Enter your membership code to verify your status and view recommendations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCheckMembership} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="membership-code">Membership Code</Label>
                                <Input 
                                    id="membership-code" 
                                    placeholder="Enter your code" 
                                    value={membershipCode}
                                    onChange={(e) => setMembershipCode(e.target.value.toUpperCase())}
                                    className="text-center text-lg tracking-widest"
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold" size="lg" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    "Check Status"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {result && (
                     <div className="mt-8">
                        {result === 'invalid' ? (
                            <Card className="text-center">
                                <CardContent className="p-6">
                                     <div className="flex flex-col items-center gap-2 text-red-700 dark:text-red-400">
                                        <XCircle className="h-10 w-10" />
                                        <p className="font-semibold">Invalid or expired membership code.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                                        <CheckCircle className="h-8 w-8" />
                                        <CardTitle className="text-2xl">Membership Active!</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Welcome, {result.customerName}! Here are your personalized recommendations.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Membership Type:</span>
                                        </div>
                                        <span className="font-bold">{result.type}</span>
                                    </div>
                                     {result.coachingPlan && (
                                        <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                                            <div className="flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Coaching Plan:</span>
                                            </div>
                                            <span className="font-bold">{result.coachingPlan}</span>
                                        </div>
                                     )}
                                     {result.expiresAt && getDaysLeft(result.expiresAt) !== null && (
                                         <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                                            <div className="flex items-center gap-2">
                                                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Days Left:</span>
                                            </div>
                                            <span className="font-bold">{getDaysLeft(result.expiresAt)} days</span>
                                        </div>
                                     )}
                                    <Separator />
                                    <h3 className="font-semibold text-lg">Recommended Products</h3>
                                    {result.recommendedProducts.length > 0 ? (
                                        <div className="space-y-3">
                                            {result.recommendedProducts.map(product => (
                                                <ProductRecommendationCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">No specific recommendations have been added for you yet. Check back soon!</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                     </div>
                )}
            </div>
        </div>
    );
}
