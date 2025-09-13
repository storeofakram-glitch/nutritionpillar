
"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCoaches } from "@/services/coach-service";
import { getMemberships } from "@/services/membership-service";
import type { Coach, Membership } from "@/types";
import CoachTable from "./_components/coach-table";
import AddCoachDialog from "./_components/add-coach-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function AdminCoachesPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchData = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const [fetchedCoaches, fetchedMemberships] = await Promise.all([
                    getCoaches(),
                    getMemberships(),
                ]);
                setCoaches(fetchedCoaches);
                setMemberships(fetchedMemberships);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch coaches or memberships." });
            } finally {
                setLoading(false);
            }
        });
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const { coachList, expertList } = useMemo(() => {
        const coachMemberships = new Map(memberships
            .filter(m => m.type === 'Coach/Expert')
            .map(m => [m.customerName, m.code])
        );

        const allPeople = coaches.map(coach => ({
            ...coach,
            membershipCode: coachMemberships.get(coach.name)
        }));

        const filtered = allPeople.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return {
            coachList: filtered.filter(c => c.type === 'Coach'),
            expertList: filtered.filter(c => c.type === 'Expert')
        };
    }, [coaches, memberships, searchTerm]);

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Coaches & Experts</h1>
                    <p className="text-muted-foreground">Manage the professionals featured on your site.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input
                            type="search"
                            placeholder="Search by name or specialty..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchData} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <AddCoachDialog onCoachAdded={fetchData} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CardTitle>Coaches</CardTitle>
                        <Badge variant="secondary">{coachList.length}</Badge>
                    </div>
                    <CardDescription>Manage the coaches displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[460px]">
                        <CoachTable data={coachList} isLoading={loading} onDataChange={fetchData} />
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CardTitle>Experts</CardTitle>
                        <Badge variant="secondary">{expertList.length}</Badge>
                    </div>
                    <CardDescription>Manage the experts displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-[460px]">
                        <CoachTable data={expertList} isLoading={loading} onDataChange={fetchData} />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
