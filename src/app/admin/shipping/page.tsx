import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddShippingZoneDialog from "./_components/add-shipping-zone-dialog"
import ShippingZonesTable from "./_components/shipping-zones-table"

export default function AdminShippingPage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle>Shipping Zones</CardTitle>
                        <CardDescription>Manage shipping zones and prices.</CardDescription>
                    </div>
                    <AddShippingZoneDialog />
                </div>
            </CardHeader>
            <CardContent>
                <ShippingZonesTable />
            </CardContent>
        </Card>
    )
}
