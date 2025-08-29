'use client'

import { useActionState } from "react"
import { generatePromoCode } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { promoCodes } from "@/lib/mock-data" // Using mock data for display

const initialState = {
  message: "",
  code: null,
}

function GeneratePromoCodeForm() {
    const [state, formAction] = useActionState(generatePromoCode, initialState);

    return (
        <form action={formAction} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button type="submit">Generate New Promo Code</Button>
            {state?.code && (
                <div className="p-2 bg-secondary rounded-md text-sm">
                    <span className="font-semibold">New Code:</span>
                    <Badge variant="outline" className="ml-2 font-mono">{state.code.code}</Badge> -
                    <span className="text-muted-foreground ml-1">
                        {state.code.type === 'percentage' ? `${state.code.discount}% off` : `$${state.code.discount} off`}
                    </span>
                </div>
            )}
            {state?.message && !state?.code && <p className="text-destructive text-sm">{state.message}</p>}
        </form>
    )
}


export default function AdminPromoCodesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Code</CardTitle>
          <CardDescription>
            Generate a new unique promotional code for your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratePromoCodeForm />
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
                    {promoCodes.map((p) => (
                        <TableRow key={p.code}>
                            <TableCell className="font-mono">{p.code}</TableCell>
                            <TableCell>{p.discount}</TableCell>
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
