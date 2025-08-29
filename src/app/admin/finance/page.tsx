
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTotalRevenue } from "@/services/order-service"
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminFinancePage() {
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [loading, setLoading] = useState(true)
    // Placeholder for expenses - you can build this out later
    const [totalExpenses, setTotalExpenses] = useState(0) 

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const revenue = await getTotalRevenue()
            setTotalRevenue(revenue)
            // In a real app, you would fetch expenses here too
            setLoading(false)
        }
        fetchData()
    }, [])

    const netProfit = totalRevenue - totalExpenses

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
                    ) : (
                        <div className="text-2xl font-bold">DZD {totalRevenue.toFixed(2)}</div>
                    )}
                    <p className="text-xs text-muted-foreground">Based on all completed orders</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">DZD {totalExpenses.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Manually entered expenses</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        DZD {netProfit.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Revenue - Total Expenses</p>
                </CardContent>
            </Card>
        </div>
    )
}
