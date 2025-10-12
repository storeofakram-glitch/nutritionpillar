
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import InboxTable from "./_components/inbox-table";
import { Input } from "@/components/ui/input";

export default function AdminInboxPage({ authLoading }: { authLoading?: boolean }) {
    // We use a key to force re-mounting of the child component
    // This is a simple way to trigger a data refresh from the parent.
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        setSearchTerm(""); // Reset search on refresh
    };
    
    return (
        <Card className="border-primary">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Inbox</CardTitle>
                        <CardDescription>View and manage messages from your website's contact form.</CardDescription>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name, email, subject..."
                                className="pl-8 sm:w-[200px] lg:w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={authLoading}>
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <InboxTable key={refreshKey} onDataChange={handleRefresh} searchTerm={searchTerm} />
            </CardContent>
        </Card>
    )
}

    