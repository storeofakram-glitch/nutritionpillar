

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { findMembershipByCode } from '@/services/membership-service';
import type { RecommendedProduct, MembershipWithProducts, Coach, CoachingApplication } from '@/types';
import { CheckCircle, XCircle, Loader2, Award, ShoppingCart, CalendarClock, Info, Star, StarHalf, Users, Mail, MessageSquare, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { differenceInDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCoachByName } from '@/services/coach-service';
import { getApplicationsByCoach, updateApplicationStatus } from '@/services/application-service';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            if (ratingValue <= rating) {
                return <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
            } else if (ratingValue - 0.5 <= rating) {
                return <StarHalf key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
            } else {
                return <Star key={i} className="h-5 w-5 text-muted-foreground/30" />;
            }
        })}
         <span className="text-muted-foreground ml-1 text-sm">({rating.toFixed(1)})</span>
    </div>
);


export default function MembershipPage() {
    const [membershipCode, setMembershipCode] = useState('');
    const [userType, setUserType] = useState('athlete');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MembershipWithProducts | 'invalid' | null>(null);
    const [coachDetails, setCoachDetails] = useState<Coach | null>(null);
    const [applications, setApplications] = useState<CoachingApplication[]>([]);
    const { toast } = useToast();

    const fetchCoachData = async (coach: Coach) => {
        const coachApps = await getApplicationsByCoach(coach.id);
        setApplications(coachApps);
    }

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
        setCoachDetails(null);
        setApplications([]);

        try {
            const foundMembership = await findMembershipByCode(membershipCode);
            if (foundMembership) {
                setResult(foundMembership);
                // If the member is a coach, fetch their specific details
                if (foundMembership.type === 'Coach/Expert' && userType === 'coach') {
                    const coach = await getCoachByName(foundMembership.customerName);
                    if (coach) {
                        setCoachDetails(coach);
                        await fetchCoachData(coach);
                    }
                }
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
    
    const handleStatusUpdate = async (appId: string, status: 'contacted' | 'rejected' | 'active') => {
        const result = await updateApplicationStatus(appId, status);
        if (result.success && coachDetails) {
            toast({ title: "Status Updated", description: `Application status changed to "${status}".` });
            // Refresh the applications list for the coach
            fetchCoachData(coachDetails);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update application status.'});
        }
    }

    const { pendingApplications, activeClients } = useMemo(() => {
        return {
            pendingApplications: applications.filter(app => ['new', 'read'].includes(app.status)),
            activeClients: applications.filter(app => app.status === 'active'),
        };
    }, [applications]);

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

    const renderCoachView = () => {
        if (!result || result === 'invalid' || !coachDetails) return null;

        const getStatusVariant = (status: CoachingApplication['status']) => {
            switch (status) {
                case 'new': return 'default';
                case 'read': return 'secondary';
                case 'contacted': return 'default';
                case 'rejected': return 'destructive';
                case 'active': return 'default';
                default: return 'secondary';
            }
        }

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-8 w-8" />
                        <CardTitle className="text-2xl">Membership Active!</CardTitle>
                    </div>
                    <CardDescription>
                        Welcome back, Coach {result.customerName}! This is your dashboard to manage client applications and track your active clients.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Specialty:</span>
                            </div>
                            <span className="font-bold">{coachDetails.specialty}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Pending Applications:</span>
                            </div>
                            <span className="font-bold">{pendingApplications.length}</span>
                        </div>
                         <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Active Clients:</span>
                            </div>
                            <span className="font-bold">{activeClients.length}</span>
                        </div>
                         <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary col-span-1 sm:col-span-2 lg:col-span-3">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Your Rating:</span>
                            </div>
                            <StarRating rating={coachDetails.rating} />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Pending Client Applications</h3>
                        {pendingApplications.length > 0 ? (
                            <div className="w-full overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Applicant</TableHead>
                                            <TableHead>Goal</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingApplications.map(app => (
                                            <TableRow key={app.id}>
                                                <TableCell className="font-medium">{app.applicant.name}</TableCell>
                                                <TableCell>{app.applicant.goal}</TableCell>
                                                <TableCell>{app.applicant.duration}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {(app.status === 'new' || app.status === 'read') && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(app.id, 'contacted')}>Accept</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(app.id, 'rejected')}>Reject</Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">You have no new client applications at the moment.</p>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Your Active Clients</h3>
                        {activeClients.length > 0 ? (
                            <div className="space-y-4">
                                {activeClients.map(app => (
                                    <Card key={app.id} className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold">{app.applicant.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={`mailto:${app.applicant.email}`}>
                                                            <Mail className="h-4 w-4" />
                                                            <span className="sr-only">Email</span>
                                                        </a>
                                                    </Button>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={`https://wa.me/${app.applicant.phone.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                            <MessageSquare className="h-4 w-4" />
                                                            <span className="sr-only">WhatsApp</span>
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 text-muted-foreground">
                                                <p><span className="font-medium text-foreground">Goal:</span> {app.applicant.goal}</p>
                                                <p><span className="font-medium text-foreground">Duration:</span> {app.applicant.duration}</p>
                                                <p><span className="font-medium text-foreground">Age:</span> {app.applicant.age}</p>
                                                <p><span className="font-medium text-foreground">Phone:</span> {app.applicant.phone}</p>
                                                <p><span className="font-medium text-foreground">Weight:</span> {app.applicant.weight}kg</p>
                                                <p><span className="font-medium text-foreground">Height:</span> {app.applicant.height}cm</p>
                                            </div>
                                            {app.applicant.message && (
                                                <div className="mt-3">
                                                    <p className="font-medium text-sm text-foreground">Message:</p>
                                                    <p className="text-sm text-muted-foreground italic">"{app.applicant.message}"</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">You have no active clients yet.</p>
                        )}
                    </div>

                </CardContent>
            </Card>
        );
    };

    const renderClientView = () => {
         if (!result || result === 'invalid') return null;

         const daysLeft = getDaysLeft(result.expiresAt);
         const isActive = daysLeft === null || daysLeft > 0;

         return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary">
                        Welcome, {result.customerName}!
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3 pt-1">
                        <span className="font-bold text-foreground">Membership Details:</span>
                        <Badge variant={isActive ? "default" : "destructive"} className={cn(isActive && 'bg-green-600 hover:bg-green-700 text-white')}>
                           {isActive ? "Active" : "Inactive"}
                        </Badge>
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
                        {result.coachName && (
                            <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Your Coach:</span>
                                </div>
                                <span className="font-bold">{result.coachName}</span>
                            </div>
                        )}
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
                        {daysLeft !== null && (
                            <div className="flex items-center justify-between text-sm p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-2">
                                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Days Left:</span>
                            </div>
                            <span className="font-bold">{daysLeft} days</span>
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
         );
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
                <Card className="mb-8 shadow-lg shadow-primary/20">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Membership</CardTitle>
                        <CardDescription className="text-lg">
                            {userType === 'athlete'
                                ? "Enter your unique membership code to access your personalized supplement guide and plan details."
                                : "Enter your unique access code to manage client applications and view your athlete dashboard."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCheckMembership} className="space-y-6">
                             <div className="space-y-3">
                                <RadioGroup defaultValue="athlete" onValueChange={setUserType} className="grid grid-cols-2 gap-4">
                                    <div>
                                        <RadioGroupItem value="athlete" id="athlete" className="peer sr-only" />
                                        <Label
                                            htmlFor="athlete"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            I am an Athlete
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="coach" id="coach" className="peer sr-only" />
                                        <Label
                                            htmlFor="coach"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            I am a Coach/Expert
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

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
                                    "Check"
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
                             userType === 'coach' && result.type === 'Coach/Expert' ? renderCoachView() : renderClientView()
                        )}
                     </div>
                )}
            </div>
        </div>
    );
}

    
