
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import type { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface BestSellingProductsCardProps {
    products: { product: Product; count: number }[];
    isLoading: boolean;
}

export default function BestSellingProductsCard({ products, isLoading }: BestSellingProductsCardProps) {
    
    const renderSkeleton = () => (
        Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))
      );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 5 Best-Selling Products</CardTitle>
                <CardDescription>Based on units sold from delivered orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Units Sold</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? renderSkeleton() : products.map(({ product, count }) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Link href={`/products/${product.id}`} className="flex items-center gap-3 group">
                                        <Image
                                            src={product.imageUrls[0]}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded-md object-cover"
                                        />
                                        <span className="font-medium group-hover:underline">{product.name}</span>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right font-bold">{count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && products.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No sales data available yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
