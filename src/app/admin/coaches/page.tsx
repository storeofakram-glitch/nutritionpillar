
"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCoaches } from "@/services/coach-service";
import type { Coach } from "@/types";
import CoachTable from "./_components/coach-table";
import AddCoachDialog from "./_components/add-coach-dialog";

export default function AdminCoachesPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchCoaches = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const fetchedCoaches = await getCoaches();
                setCoaches(fetchedCoaches);
            } catch (error) {
                console.error("Failed to fetch coaches:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch coaches." });
            } finally {
                setLoading(false);
            }
        });
    };
    
    useEffect(() => {
        fetchCoaches();
    }, []);

    const { coachList, expertList } = useMemo(() => {
        return {
            coachList: coaches.filter(c => c.type === 'Coach'),
            expertList: coaches.filter(c => c.type === 'Expert')
        };
    }, [coaches]);

    return (
        <div className="space-y-6">
             <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Coaches & Experts</h1>
                    <p className="text-muted-foreground">Manage the professionals featured on your site.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchCoaches} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <AddCoachDialog onCoachAdded={fetchCoaches} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coaches</CardTitle>
                    <CardDescription>Manage the coaches displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CoachTable data={coachList} isLoading={loading} onDataChange={fetchCoaches} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Experts</CardTitle>
                    <CardDescription>Manage the experts displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CoachTable data={expertList} isLoading={loading} onDataChange={fetchCoaches} />
                </CardContent>
            </Card>
        </div>
    );
}
