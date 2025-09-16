
"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMemberships, generateLoyaltyMemberships } from "@/services/membership-service";
import type { Membership } from "@/types";
import MembershipTable from "./_components/membership-table";
import AddMembershipDialog from "./_components/add-membership-dialog";

export default function AdminMembershipPage({ authLoading }: { authLoading?: boolean }) {
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchMemberships = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const fetchedMemberships = await getMemberships();
                setMemberships(fetchedMemberships);
            } catch (error) {
                console.error("Failed to fetch memberships:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch memberships." });
            } finally {
                setLoading(false);
            }
        });
    };
    
    useEffect(() => {
        fetchMemberships();
    }, []);

    const handleGenerateLoyalty = async () => {
        startTransition(async () => {
             const result = await generateLoyaltyMemberships();
             if (result.success) {
                toast({
                    title: "Loyalty Check Complete",
                    description: `Generated ${result.newMemberships} new Fitness Pillar memberships.`,
                });
                fetchMemberships();
             } else {
                toast({ variant: "destructive", title: "Error", description: result.error || "Failed to generate loyalty memberships." });
             }
        });
    }

    const coachingMemberships = memberships.filter(m => m.type === 'Coaching');
    const loyaltyMemberships = memberships.filter(m => m.type === 'Fitness Pillar');
    const coachExpertMemberships = memberships.filter(m => m.type === 'Coach/Expert');

    return (
        <div className="space-y-6">
             <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Membership Management</h1>
                    <p className="text-muted-foreground">Manage coaching clients and view loyalty program members.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchMemberships} disabled={isPending || authLoading}>
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <AddMembershipDialog onMembershipAdded={fetchMemberships} />
                </div>
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle>Coaching Memberships (Clients)</CardTitle>
                            <CardDescription>Manually added members from your coaching program.</CardDescription>
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <MembershipTable memberships={coachingMemberships} isLoading={loading} onDataChange={fetchMemberships} />
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Coaches & Experts Memberships</CardTitle>
                    <CardDescription>Memberships automatically created for your team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MembershipTable memberships={coachExpertMemberships} isLoading={loading} onDataChange={fetchMemberships} />
                </CardContent>
            </Card>

             <Card className="shadow-md">
                <CardHeader>
                     <div className="flex items-center justify-between">
                         <div>
                            <CardTitle>Fitness Pillar Loyalty Members</CardTitle>
                            <CardDescription>Customers who automatically joined the loyalty program.</CardDescription>
                         </div>
                         <Button onClick={handleGenerateLoyalty} disabled={isPending || authLoading} size="sm">
                            <ShieldPlus className="mr-2 h-4 w-4" />
                            {isPending ? 'Checking...' : 'Check for New Loyalty Members'}
                         </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <MembershipTable memberships={loyaltyMemberships} isLoading={loading} onDataChange={fetchMemberships} />
                </CardContent>
            </Card>
        </div>
    );
}
