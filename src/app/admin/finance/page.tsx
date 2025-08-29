
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTotalRevenue, getOrders, getTotalCostOfGoodsSold } from "@/services/order-service"
import { DollarSign, TrendingDown, TrendingUp, RefreshCw, ShoppingCart, MinusCircle, Package } from "lucide-react"
import { useEffect, useState, useTransition, useMemo } from "react"
import AddExpenseDialog from "./_components/add-expense-dialog"
import { getExpenses, getTotalExpenses } from "@/services/expense-service"
import FinanceChart from "./_components/finance-chart"
import TransactionHistory from "./_components/transaction-history"
import type { Order, Expense, MonthlyFinanceData, Product } from "@/types"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { getProducts } from "@/services/product-service"

export default function AdminFinancePage() {
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [totalCOGS, setTotalCOGS] = useState(0);
    const [inventoryValue, setInventoryValue] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition();

    const fetchFinanceData = () => {
        setLoading(true)
        startTransition(async () => {
            try {
                const [revenue, expensesTotal, cogs, fetchedOrders, fetchedExpenses, fetchedProducts] = await Promise.all([
                    getTotalRevenue(),
                    getTotalExpenses(),
                    getTotalCostOfGoodsSold(),
                    getOrders(),
                    getExpenses(),
                    getProducts(),
                ]);
                setTotalRevenue(revenue);
                setTotalExpenses(expensesTotal);
                setTotalCOGS(cogs);
                setOrders(fetchedOrders);
                setExpenses(fetchedExpenses);
                
                const totalInventoryValue = fetchedProducts.reduce((sum, product) => {
                    return sum + (product.buyingPrice || 0) * product.quantity;
                }, 0);
                setInventoryValue(totalInventoryValue);

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

    const monthlyData: MonthlyFinanceData[] = useMemo(() => {
        const data: MonthlyFinanceData[] = Array(12).fill(null).map((_, i) => ({
            month: format(new Date(0, i), 'MMM'),
            revenue: 0,
            expenses: 0,
            profit: 0
        }));

        orders.forEach(order => {
            if (order.status === 'delivered') {
                const monthIndex = new Date(order.date).getMonth();
                data[monthIndex].revenue += order.amount;
            }
        });

        expenses.forEach(expense => {
            const monthIndex = new Date(expense.date).getMonth();
            data[monthIndex].expenses += expense.amount;
        });

        data.forEach(monthData => {
            monthData.profit = monthData.revenue - monthData.expenses;
        });

        return data;

    }, [orders, expenses]);

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                        <p className="text-xs text-muted-foreground">From delivered orders</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cost of Goods Sold</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loading ? (
                            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
                        ) : (
                            <div className="text-2xl font-bold">DZD {totalCOGS.toFixed(2)}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Total cost of delivered products</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
                        ) : (
                            <div className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                DZD {grossProfit.toFixed(2)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Revenue - COGS</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Other Expenses</CardTitle>
                        <MinusCircle className="h-4 w-4 text-muted-foreground" />
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
                        <p className="text-xs text-muted-foreground">Gross Profit - Expenses</p>
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2 lg:col-span-3 xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
                        ) : (
                            <div className="text-2xl font-bold">DZD {inventoryValue.toFixed(2)}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Value of all products in stock at buying price</p>
                    </CardContent>
                </Card>
            </div>

            <FinanceChart data={monthlyData} />

            <TransactionHistory 
                orders={orders} 
                expenses={expenses} 
                isLoading={loading} 
                onDataChange={fetchFinanceData}
            />
        </div>
    )
}
