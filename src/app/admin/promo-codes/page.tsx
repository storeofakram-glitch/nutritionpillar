'use client'

import { useActionState, useState, useEffect } from "react"
import { generatePromoCode } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { promoCodes as initialPromoCodes } from "@/lib/mock-data"
import type { PromoCode } from "@/types"
import { Loader2 } from "lucide-react"

const initialState: { message: string; codes: PromoCode[] | null } = {
  message: "",
  codes: null,
}

function GeneratePromoCodeForm({ onCodeGenerated }: { onCodeGenerated: (newCode: PromoCode) => void }) {
    const [state, formAction] = useActionState(generatePromoCode, initialState);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (state.message && state.codes) {
            const newCode = state.codes.find(c => !initialPromoCodes.some(ic => ic.code === c.code));
            if (newCode) {
                onCodeGenerated(newCode);
            }
        }
        setIsPending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        formAction(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate New Promo Code
            </Button>
            {state?.message && !state?.codes && <p className="text-destructive text-sm">{state.message}</p>}
        </form>
    )
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>(initialPromoCodes);

  const handleCodeGenerated = (newCode: PromoCode) => {
    setCodes(prevCodes => [newCode, ...prevCodes]);
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
          <GeneratePromoCodeForm onCodeGenerated={handleCodeGenerated} />
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
