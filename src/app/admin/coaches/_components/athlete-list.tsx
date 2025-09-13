
"use client";

import { useEffect, useState } from "react";
import type { CoachingApplication, Membership } from "@/types";
import { getActiveApplicationsByCoach } from "@/services/application-service";
import { findMembershipByApplicationId } from "@/services/membership-service";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AthleteListProps {
  coachId: string;
}

type Athlete = CoachingApplication & { membershipCode?: string };

export default function AthleteList({ coachId }: AthleteListProps) {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        const activeApps = await getActiveApplicationsByCoach(coachId);
        
        const athletesWithCodes = await Promise.all(
            activeApps.map(async (app) => {
                const membership = await findMembershipByApplicationId(app.id);
                return { ...app, membershipCode: membership?.code };
            })
        );
        
        setAthletes(athletesWithCodes);
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Membership code copied to clipboard." });
    }

    // Use effect to fetch data when the sheet is triggered to open
    // A simple way to do this is to call it when the component mounts and
    // rely on the user to refresh the page for the latest data for now.
    useEffect(() => {
        fetchData();
    }, [coachId]);
    
    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="h-auto p-1 text-sm">
                        {loading ? '...' : athletes.length} {athletes.length === 1 ? 'Athlete' : 'Athletes'}
                    </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Active Athletes</SheetTitle>
                        <SheetDescription>
                            A list of all currently active clients for this coach.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                        {athletes.length > 0 ? athletes.map(athlete => (
                            <Card key={athlete.id} className="bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold">{athlete.applicant.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <a href={`mailto:${athlete.applicant.email}`}>
                                                    <Mail className="h-4 w-4" />
                                                    <span className="sr-only">Email</span>
                                                </a>
                                            </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <a href={`https://wa.me/${athlete.applicant.phone.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span className="sr-only">WhatsApp</span>
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3 text-muted-foreground">
                                        <p><span className="font-medium text-foreground">Goal:</span> {athlete.applicant.goal}</p>
                                        <p><span className="font-medium text-foreground">Duration:</span> {athlete.applicant.duration}</p>
                                        <p><span className="font-medium text-foreground">Email:</span> {athlete.applicant.email}</p>
                                        <p><span className="font-medium text-foreground">Phone:</span> {athlete.applicant.phone}</p>
                                        {athlete.membershipCode && (
                                            <div className="col-span-2 flex items-center gap-2">
                                                <span className="font-medium text-foreground">Code:</span>
                                                <Badge variant="secondary">{athlete.membershipCode}</Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(athlete.membershipCode!)}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No active athletes found for this coach.</p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

