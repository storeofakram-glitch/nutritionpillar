import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Admin Dashboard</CardTitle>
                    <CardDescription>Manage your store, products, and orders from here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Select a section from the sidebar to get started.</p>
                </CardContent>
            </Card>
        </div>
    )
}
