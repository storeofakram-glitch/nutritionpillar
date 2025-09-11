
"use client";

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
import { Skeleton } from "@/components/ui/skeleton";

interface RegionalDemandChartProps {
    data: { name: string; total: number }[];
    isLoading: boolean;
}

const chartConfig = {
  total: {
    label: "Items Sold",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function RegionalDemandChart({ data, isLoading }: RegionalDemandChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[250px]" />
                </CardContent>
            </Card>
        )
    }
  
    return (
        <Card>
            <CardHeader>
                <CardTitle>Regional Product Demand</CardTitle>
                <CardDescription>Total items sold per state across all orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={data}
                            layout="vertical"
                            margin={{ left: 10, right: 10 }}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 15)}
                                reversed
                            />
                            <XAxis dataKey="total" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    indicator="line" 
                                    nameKey="name"
                                />}
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={5} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No regional data to display.</p>
                )}
            </CardContent>
        </Card>
    );
}
