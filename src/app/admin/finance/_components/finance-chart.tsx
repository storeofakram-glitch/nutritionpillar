
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"

interface FinanceChartProps {
    revenue: number;
    expenses: number;
    profit: number;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-5))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function FinanceChart({ revenue, expenses, profit }: FinanceChartProps) {
    const chartData = [
        { label: "Metrics", revenue, expenses, profit },
    ];
  
    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>A visual summary of your key financial metrics.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                         <CartesianGrid vertical={false} />
                         <XAxis
                            dataKey="label"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <YAxis
                            tickFormatter={(value) => `DZD ${value / 1000}k`}
                         />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent 
                                formatter={(value, name) => (
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{chartConfig[name as keyof typeof chartConfig].label}</span>
                                        <span>DZD {Number(value).toFixed(2)}</span>
                                    </div>
                                )}
                                labelClassName="hidden"
                            />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                        <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
