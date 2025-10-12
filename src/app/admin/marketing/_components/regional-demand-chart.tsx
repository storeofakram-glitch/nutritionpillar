
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
            <Card className="border-primary">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[400px]" />
                </CardContent>
            </Card>
        )
    }
  
    return (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle>Regional Product Demand</CardTitle>
                <CardDescription>Total items sold per state across all orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 60,
                                left: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    indicator="line" 
                                    nameKey="name"
                                />}
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No regional data to display.</p>
                )}
            </CardContent>
        </Card>
    );
}

    