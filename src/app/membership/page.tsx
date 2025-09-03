// This is a new file for the membership checking page.
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkMembership } from '@/services/membership-service';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function MembershipPage() {
    const [membershipCode, setMembershipCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
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
        setValidationResult(null);
        const result = await checkMembership(membershipCode);
        
        if (result.isValid) {
            setValidationResult('valid');
        } else {
            setValidationResult('invalid');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Membership Status</CardTitle>
                        <CardDescription className="text-lg">
                            Enter your coaching membership code to verify your status.
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

                        {validationResult && (
                             <div className="mt-6 text-center">
                                {validationResult === 'valid' && (
                                    <div className="flex flex-col items-center gap-2 p-4 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                        <CheckCircle className="h-10 w-10" />
                                        <p className="font-semibold">Your membership is active!</p>
                                    </div>
                                )}
                                {validationResult === 'invalid' && (
                                     <div className="flex flex-col items-center gap-2 p-4 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                        <XCircle className="h-10 w-10" />
                                        <p className="font-semibold">Invalid or expired membership code.</p>
                                    </div>
                                )}
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}