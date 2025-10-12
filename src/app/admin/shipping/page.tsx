
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddShippingZoneDialog from "./_components/add-shipping-zone-dialog"
import ShippingZonesTable from "./_components/shipping-zones-table"
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminShippingPage({ authLoading }: { authLoading?: boolean }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        setSearchTerm("");
    };
    
    return (
        <Card className="border-primary">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Shipping Zones</CardTitle>
                        <CardDescription>Manage shipping zones and prices.</CardDescription>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                         <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by state..."
                                className="pl-8 sm:w-[200px] lg:w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={authLoading}>
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                        </Button>
                        <AddShippingZoneDialog />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ShippingZonesTable key={refreshKey} searchTerm={searchTerm} />
            </CardContent>
        </Card>
    )
}

    