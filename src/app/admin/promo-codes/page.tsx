'use client'

import { useState, useTransition } from "react"
import { generatePromoCode } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { promoCodes as initialPromoCodes } from "@/lib/mock-data"
import type { PromoCode } from "@/types"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateCode = () => {
    startTransition(async () => {
      try {
        const newCode = await generatePromoCode();
        setCodes(prevCodes => [newCode, ...prevCodes]);
        toast({
          title: "Success!",
          description: `Generated new promo code: ${newCode.code}`
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate promo code."
        });
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Code</CardTitle>
          <CardDescription>
            Generate a new unique promotional code for your customers. The new code will be added to the top of the list below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateCode} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate New Promo Code
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Promo Codes</CardTitle>
          <CardDescription>List of all promotional codes.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {codes.map((p) => (
                        <TableRow key={p.code}>
                            <TableCell className="font-mono">{p.code}</TableCell>
                            <TableCell>{p.type === 'percentage' ? `${p.discount}%` : `$${p.discount}`}</TableCell>
                            <TableCell>{p.type}</TableCell>
                            <TableCell>
                                <Badge variant={p.used ? "secondary" : "default"}>
                                    {p.used ? 'Used' : 'Active'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
