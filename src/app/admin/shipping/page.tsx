
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddShippingZoneDialog from "./_components/add-shipping-zone-dialog"
import ShippingZonesTable from "./_components/shipping-zones-table"
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AdminShippingPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Shipping Zones</CardTitle>
                        <CardDescription>Manage shipping zones and prices.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                        </Button>
                        <AddShippingZoneDialog />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ShippingZonesTable key={refreshKey} />
            </CardContent>
        </Card>
    )
}
