import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Wand2 } from "lucide-react";

export default function AdminAiToolsPage() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Supplement Recommendation</CardTitle>
                            <CardDescription className="mt-1">
                                Test the AI-powered supplement recommendation tool.
                            </CardDescription>
                        </div>
                        <BrainCircuit className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        This tool helps users find the right supplements based on their profile and fitness goals. You can test it to see what recommendations it provides.
                    </p>
                    <Button asChild>
                        <Link href="/recommendation">
                            <Wand2 className="mr-2 h-4 w-4" />
                            Go to Recommendation Tool
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
