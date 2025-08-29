
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTotalRevenue, getOrders } from "@/services/order-service"
import { DollarSign, TrendingDown, TrendingUp, RefreshCw } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import AddExpenseDialog from "./_components/add-expense-dialog"
import { getExpenses, getTotalExpenses } from "@/services/expense-service"
import FinanceChart from "./_components/finance-chart"
import TransactionHistory from "./_components/transaction-history"
import type { Order, Expense } from "@/types"
import { Button } from "@/components/ui/button"

export default function AdminFinancePage() {
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [orders, setOrders] = useState<Order[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition();

    const fetchFinanceData = () => {
        setLoading(true)
        startTransition(async () => {
            try {
                const [revenue, expensesTotal, fetchedOrders, fetchedExpenses] = await Promise.all([
                    getTotalRevenue(),
                    getTotalExpenses(),
                    getOrders(),
                    getExpenses()
                ]);
                setTotalRevenue(revenue);
                setTotalExpenses(expensesTotal);
                setOrders(fetchedOrders);
                setExpenses(fetchedExpenses);
            } catch (error) {
                console.error("Failed to fetch finance data:", error)
            } finally {
                setLoading(false)
            }
        });
    }

    useEffect(() => {
        fetchFinanceData()
    }, [])

    const netProfit = totalRevenue - totalExpenses

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Finance Overview</h1>
                    <p className="text-muted-foreground">Track your store's financial performance.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchFinanceData} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <AddExpenseDialog onExpenseAdded={fetchFinanceData} />
                 </div>
            </div>

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
                         {loading ? (
                            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
                        ) : (
                            <div className="text-2xl font-bold">DZD {totalExpenses.toFixed(2)}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Manually entered expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
                        ) : (
                            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                DZD {netProfit.toFixed(2)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Total Revenue - Total Expenses</p>
                    </CardContent>
                </Card>
            </div>

            <FinanceChart revenue={totalRevenue} expenses={totalExpenses} profit={netProfit} />

            <TransactionHistory orders={orders} expenses={expenses} isLoading={loading} />
        </div>
    )
}
