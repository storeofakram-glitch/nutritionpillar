
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFinanceCoachingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-headline tracking-tight">Finance (Coaching)</h1>
                <p className="text-muted-foreground">Manage financial details related to coaches and experts.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>This section is under construction. Please check back later for full functionality.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You will be able to manage coach payouts, view earnings per coach, and track financial performance related to your coaching services here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
