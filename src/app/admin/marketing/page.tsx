
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMarketingPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Marketing</h1>
        <p className="text-muted-foreground">Tools and strategies to grow your business.</p>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                    This section is under construction. Powerful marketing tools are on the way!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>We are working hard to bring you features like:</p>
                <ul className="list-disc list-inside mt-4 text-muted-foreground space-y-2">
                    <li>Email Campaign Management</li>
                    <li>SMS Notifications</li>
                    <li>Customer Segmentation Insights</li>
                    <li>Promotional Code Generation</li>
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
