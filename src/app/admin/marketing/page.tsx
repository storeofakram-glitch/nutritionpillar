
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerExportForm from "./_components/customer-export-form";

export default function AdminMarketingPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tight">Marketing</h1>
            <p className="text-muted-foreground">Tools and strategies to grow your business.</p>
        </div>
        
        <CustomerExportForm />

    </div>
  );
}
