
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import InboxTable from "./_components/inbox-table";

export default function AdminInboxPage({ authLoading }: { authLoading?: boolean }) {
    // We use a key to force re-mounting of the child component
    // This is a simple way to trigger a data refresh from the parent.
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Inbox</CardTitle>
                        <CardDescription>View and manage messages from your website's contact form.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={authLoading}>
                        <RefreshCw className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <InboxTable key={refreshKey} onDataChange={handleRefresh} />
            </CardContent>
        </Card>
    )
}
