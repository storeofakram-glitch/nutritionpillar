
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Membership } from "@/types";
import { getMemberships } from "@/services/membership-service";
import { Download, ShieldCheck, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembershipExportCard() {
    const { toast } = useToast();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const membershipsData = await getMemberships();
            setMemberships(membershipsData);
            setLoading(false);
        }
        loadData();
    }, []);

    const downloadCSV = (data: Membership[], filename: string) => {
        if (data.length === 0) {
            toast({
                variant: 'destructive',
                title: "No Members Found",
                description: "There are no members in this category to export.",
            });
            return;
        }

        const csvHeader = "Name,Email,Phone,Membership Code";
        const csvRows = data.map(m => {
            const name = `"${m.customerName.replace(/"/g, '""')}"`;
            const email = `"${m.customerEmail || ''}"`;
            const phone = `"${m.customerPhone || ''}"`;
            const code = `"${m.code}"`;
            return [name, email, phone, code].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Download Started",
            description: `Your member list is downloading.`
        });
    };

    const handleDownloadLoyalty = () => {
        const loyaltyMembers = memberships.filter(m => m.type === 'Fitness Pillar');
        downloadCSV(loyaltyMembers, `loyalty_members_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleDownloadCoaching = () => {
        const coachingClients = memberships.filter(m => m.type === 'Coaching');
        downloadCSV(coachingClients, `coaching_clients_${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Membership Lists</CardTitle>
                <CardDescription>
                    Download lists of your loyalty program members and coaching clients.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button onClick={handleDownloadLoyalty} disabled={loading || memberships.filter(m => m.type === 'Fitness Pillar').length === 0} className="w-full">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Download Loyalty Members
                </Button>
                <Button onClick={handleDownloadCoaching} disabled={loading || memberships.filter(m => m.type === 'Coaching').length === 0} className="w-full" variant="secondary">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Download Coaching Clients
                </Button>
            </CardContent>
        </Card>
    );
}
