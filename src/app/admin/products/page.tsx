import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProductsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Products Management</CardTitle>
                <CardDescription>Here you can add, edit, and delete products.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Product management interface will be built here.</p>
            </CardContent>
        </Card>
    )
}
