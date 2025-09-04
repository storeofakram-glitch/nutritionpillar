
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { findMembershipByCode } from '@/services/membership-service';
import type { RecommendedProduct, MembershipWithProducts } from '@/types';
import { CheckCircle, XCircle, Loader2, Award, ShoppingCart, CalendarClock, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { differenceInDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    
    const SupplementGuideTable = ({ recommendations }: { recommendations: (RecommendedProduct & { product: any })[] }) => (
        <div className="w-full overflow-hidden rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Usage Instructions</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recommendations.map(rec => (
                        <TableRow key={rec.productId}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={rec.product.imageUrls[0]}
                                        alt={rec.product.name}
                                        width={40}
                                        height={40}
                                        className="rounded-md object-cover"
                                    />
                                    <span>{rec.product.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-pre-wrap">{rec.usage}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" asChild>
                                    <Link href={`/products/${rec.product.id}`}>View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const getDaysLeft = (expiresAt?: string): number | null => {
        if (!expiresAt) return null;
        const days = differenceInDays(new Date(expiresAt), new Date());
        return Math.max(0, days);
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-2xl mx-auto">
                <Card className="mb-8 shadow-lg shadow-primary/20">
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
                                        Welcome, {result.customerName}! Here is your personalized supplement guide.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                         {result.goal && (
                                            <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Primary Goal:</span>
                                                </div>
                                                <span className="font-bold">{result.goal}</span>
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
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Your Supplement Guide</h3>
                                        {result.recommendedProducts.length > 0 ? (
                                           <SupplementGuideTable recommendations={result.recommendedProducts} />
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">No specific recommendations have been added for you yet. Check back soon!</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                     </div>
                )}
            </div>
        </div>
    );
}
