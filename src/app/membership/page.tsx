

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { findMembershipByCode } from '@/services/membership-service';
import type { RecommendedProduct, MembershipWithProducts, Coach, CoachingApplication, Membership, CoachFinancials, CoachPayout } from '@/types';
import { CheckCircle, XCircle, Loader2, Award, ShoppingCart, CalendarClock, Info, Star, StarHalf, Users, Mail, MessageSquare, User, UserX, History, Copy, Wallet, TrendingUp, Search, BookOpen, Dumbbell, HeartPulse } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { differenceInDays, format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCoachByName } from '@/services/coach-service';
import { getApplicationsByCoach, updateApplicationStatus, deleteApplication } from '@/services/application-service';
import { getCoachFinancialsById, getCoachPayoutsByCoachId } from '@/services/coach-finance-service';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { findMembershipByApplicationId } from '@/services/membership-service';
import RevokeAccessDialog from './_components/revoke-access-dialog';
import AthleteHistoryDialog from './_components/athlete-history-dialog';
import ManageProgramsDialog from './_components/manage-programs-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            if (ratingValue <= rating) {
                return <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400 stroke-white stroke-[0.5]" />;
            } else if (ratingValue - 0.5 <= rating) {
                return <StarHalf key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400 stroke-white stroke-[0.5]" />;
            } else {
                return <Star key={i} className="h-5 w-5 text-muted-foreground/30 fill-muted-foreground/20 stroke-white stroke-[0.5]" />;
            }
        })}
         <span className="text-muted-foreground ml-1 text-sm">({rating.toFixed(1)})</span>
    </div>
);

type EnrichedApplication = CoachingApplication & {
    membership?: Membership;
};


export default function MembershipPage() {
    const [membershipCode, setMembershipCode] = useState('');
    const [userType, setUserType] = useState('athlete');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MembershipWithProducts | 'invalid' | null>(null);
    const [coachDetails, setCoachDetails] = useState<Coach | null>(null);
    const [coachFinancials, setCoachFinancials] = useState<CoachFinancials | null>(null);
    const [applications, setApplications] = useState<EnrichedApplication[]>([]);
    const [payoutHistory, setPayoutHistory] = useState<CoachPayout[]>([]);
    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
    const [selectedAppForRevoke, setSelectedAppForRevoke] = useState<CoachingApplication | null>(null);
    const [activeClientSearchTerm, setActiveClientSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchCoachData = async (coach: Coach) => {
        const [coachApps, financials, payouts] = await Promise.all([
            getApplicationsByCoach(coach.id),
            getCoachFinancialsById(coach.id),
            getCoachPayoutsByCoachId(coach.id)
        ]);

        const enrichedApps = await Promise.all(
            coachApps.map(async (app) => {
                const membership = await findMembershipByApplicationId(app.id);
                return { ...app, membership: membership || undefined };
            })
        );
        setApplications(enrichedApps);
        setCoachFinancials(financials);
        setPayoutHistory(payouts);
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
        setCoachFinancials(null);
        setPayoutHistory([]);

        try {
            const foundMembership = await findMembershipByCode(membershipCode);

            if (!foundMembership) {
                setResult('invalid');
                setIsLoading(false);
                return;
            }

            // Check for user type mismatch
            if (userType === 'coach' && foundMembership.type !== 'Coach/Expert') {
                toast({ variant: 'destructive', title: 'Invalid User Type', description: 'This code belongs to an athlete. Please select "I am an Athlete".' });
                setResult('invalid');
                setIsLoading(false);
                return;
            } else if (userType === 'athlete' && foundMembership.type === 'Coach/Expert') {
                toast({ variant: 'destructive', title: 'Invalid User Type', description: 'This code belongs to a coach. Please select "I am a Coach/Expert".' });
                setResult('invalid');
                setIsLoading(false);
                return;
            }

            setResult(foundMembership);

            // If the member is a coach, fetch their specific details
            if (foundMembership.type === 'Coach/Expert' && userType === 'coach') {
                const coach = await getCoachByName(foundMembership.customerName);
                if (coach) {
                    setCoachDetails(coach);
                    await fetchCoachData(coach);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Coach Data Missing',
                        description: `Membership code is valid, but we couldn't find the associated coach profile.`,
                    });
                }
            }
        } catch (error) {
            console.error("Error during membership check:", error);
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'Could not verify membership. Please try again.' });
            setResult('invalid');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStatusUpdate = async (appId: string, status: CoachingApplication['status']) => {
        const result = await updateApplicationStatus(appId, status);
        if (result.success && coachDetails) {
            if (status === 'contacted') {
                 toast({ title: "Application Accepted!", description: "The administration will process your new client soon." });
            } else {
                toast({ title: "Status Updated", description: `Application status changed to "${status}".` });
            }
            fetchCoachData(coachDetails);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update application status.'});
        }
    }

    const handleRejectApplication = async (appId: string) => {
        const result = await deleteApplication(appId);
        if (result.success && coachDetails) {
             toast({ title: "Application Rejected", description: "The application has been permanently deleted." });
             fetchCoachData(coachDetails);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject application.'});
        }
    };

     const handleArchiveAthlete = async (appId: string) => {
        await handleStatusUpdate(appId, 'archived');
    };

    const handleOpenRevokeDialog = (app: CoachingApplication) => {
        setSelectedAppForRevoke(app);
        setIsRevokeDialogOpen(true);
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Membership code copied to clipboard." });
    }

    const { pendingApplications, activeClients, archivedClients } = useMemo(() => {
        return {
            pendingApplications: applications.filter(app => ['new', 'contacted'].includes(app.status)),
            activeClients: applications.filter(app => app.status === 'active'),
            archivedClients: applications.filter(app => app.status === 'archived')
        };
    }, [applications]);

    const filteredActiveClients = useMemo(() => {
        if (!activeClientSearchTerm) return activeClients;
        return activeClients.filter(app =>
            app.applicant.name.toLowerCase().includes(activeClientSearchTerm.toLowerCase())
        );
    }, [activeClients, activeClientSearchTerm]);

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
    
    const getDaysLeftColor = (days: number | null): string => {
        if (days === null) return "text-muted-foreground";
        if (days < 10) return "text-red-500 font-semibold";
        if (days <= 20) return "text-yellow-500 font-semibold";
        return "text-green-600 font-semibold";
    };

    const renderCoachView = () => {
        if (!result || result === 'invalid' || !coachDetails) return null;

        const getStatusStyles = (status: CoachingApplication['status']): string => {
            switch (status) {
                case 'new': return 'bg-primary hover:bg-primary/80';
                case 'active': return 'bg-green-600 hover:bg-green-700 text-white';
                case 'contacted':
                    return 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900';
                 case 'archived':
                 case 'rejected':
                    return 'bg-red-600 hover:bg-red-700 text-white';
                default: return ''; // uses default from Badge variant
            }
        }
        
         const getPayoutStatusStyles = (status: CoachPayout['status']): string => {
            switch (status) {
                case 'completed': return 'bg-green-600 hover:bg-green-700 text-white';
                case 'pending': return 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900';
                case 'failed': return 'bg-red-600 hover:bg-red-700 text-white';
                default: return '';
            }
        }

        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-8 w-8" />
                            <CardTitle className="text-2xl">Membership Active!</CardTitle>
                        </div>
                        <AthleteHistoryDialog athletes={archivedClients} />
                    </div>
                     <CardDescription className="pt-2">
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
                    
                    {coachFinancials && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending Payout</CardTitle>
                                    <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">DZD {coachFinancials.pendingPayout.toFixed(2)}</div>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-500">Amount waiting to be paid out to you.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total Paid</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">DZD {coachFinancials.paidOut.toFixed(2)}</div>
                                    <p className="text-xs text-green-600 dark:text-green-500">Total amount you have been paid out.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}


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
                                                    <Badge variant={'default'} className={cn(getStatusStyles(app.status))}>{app.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {app.status === 'new' && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(app.id, 'contacted')}>Accept</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectApplication(app.id)}>Reject</Button>
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                            <h3 className="font-semibold text-lg">Your Active Clients</h3>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name..."
                                    className="pl-8"
                                    value={activeClientSearchTerm}
                                    onChange={(e) => setActiveClientSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        {filteredActiveClients.length > 0 ? (
                            <ScrollArea className="h-[40rem] pr-4">
                                <div className="space-y-4">
                                    {filteredActiveClients.map(app => {
                                        const daysLeft = getDaysLeft(app.membership?.expiresAt);
                                        const isActive = daysLeft === null || daysLeft > 0;
                                        return (
                                        <Card key={app.id} className="bg-muted/50">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{app.applicant.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant={isActive ? "default" : "destructive"} className={cn("text-xs", isActive && "bg-green-600 hover:bg-green-700")}>
                                                                {isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                            {daysLeft !== null && (
                                                                <div className={cn("flex items-center gap-1 text-sm", getDaysLeftColor(daysLeft))}>
                                                                    <CalendarClock className="h-3 w-3" />
                                                                    <span>{daysLeft} days left</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <ManageProgramsDialog application={app} onUpdate={() => fetchCoachData(coachDetails)} />
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
                                                         <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleOpenRevokeDialog(app)}>
                                                            <UserX className="h-4 w-4" />
                                                            <span className="sr-only">Archive Athlete</span>
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
                                                     {app.membership?.code && (
                                                        <div className="col-span-2 flex items-center gap-2">
                                                            <span className="font-medium text-foreground">Code:</span>
                                                            <Badge variant="secondary">{app.membership.code}</Badge>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(app.membership!.code)}>
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                {app.applicant.message && (
                                                    <div className="mt-3">
                                                        <p className="font-medium text-sm text-foreground">Message:</p>
                                                        <p className="text-sm text-muted-foreground italic">"{app.applicant.message}"</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )})}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                {activeClientSearchTerm ? `No clients found for "${activeClientSearchTerm}".` : 'You have no active clients yet.'}
                            </p>
                        )}
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-4">Your Payout History</h3>
                        {payoutHistory.length > 0 ? (
                            <div className="w-full overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payoutHistory.map(payout => (
                                            <TableRow key={payout.id}>
                                                <TableCell>{payout.clientName}</TableCell>
                                                <TableCell>{payout.planTitle}</TableCell>
                                                <TableCell>{format(new Date(payout.payoutDate), 'PPP')}</TableCell>
                                                <TableCell className="font-medium">DZD {payout.amount.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={'default'} className={cn(getPayoutStatusStyles(payout.status))}>{payout.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">You have no payout history yet.</p>
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
                         {daysLeft !== null && (
                            <div className={cn("flex items-center gap-1 text-sm", getDaysLeftColor(daysLeft))}>
                                <CalendarClock className="h-3 w-3" />
                                <span>{daysLeft} days left</span>
                            </div>
                        )}
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
                    </div>
                    {(result as any).applicant?.nutritionPlanUrl || (result as any).applicant?.trainingPlanUrl ? (
                         <div className="flex flex-col sm:flex-row gap-4">
                            {(result as any).applicant.nutritionPlanUrl && (
                                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                    <Link href={(result as any).applicant.nutritionPlanUrl} target="_blank" rel="noopener noreferrer">
                                        <HeartPulse className="mr-2 h-4 w-4" />
                                        View Nutrition Plan
                                    </Link>
                                </Button>
                            )}
                             {(result as any).applicant.trainingPlanUrl && (
                                <Button asChild variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                                    <Link href={(result as any).applicant.trainingPlanUrl} target="_blank" rel="noopener noreferrer">
                                        <Dumbbell className="mr-2 h-4 w-4" />
                                        View Training Plan
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : null}

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
                <Card className="mb-8">
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
                                <RadioGroup 
                                    defaultValue="athlete" 
                                    onValueChange={setUserType} 
                                    className="grid grid-cols-2 gap-4"
                                    disabled={!!(result && result !== 'invalid')}
                                >
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

            {selectedAppForRevoke && (
                <RevokeAccessDialog
                    isOpen={isRevokeDialogOpen}
                    onOpenChange={setIsRevokeDialogOpen}
                    athleteName={selectedAppForRevoke.applicant.name}
                    onConfirm={() => handleArchiveAthlete(selectedAppForRevoke.id)}
                />
            )}
        </div>
    );
}
