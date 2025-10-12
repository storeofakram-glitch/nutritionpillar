
"use client";

import { useEffect, useState, useMemo } from "react";
import CustomerExportForm from "./_components/customer-export-form";
import MembershipExportCard from "./_components/membership-export-card";
import { getOrders } from "@/services/order-service";
import type { Order } from "@/types";
import BestSellingProductsCard from "./_components/best-selling-products-card";
import RegionalDemandChart from "./_components/regional-demand-chart";
import CoachExportForm from "./_components/coach-export-form";

export default function AdminMarketingPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const ordersData = await getOrders();
            setOrders(ordersData);
            setLoading(false);
        }
        loadData();
    }, []);

    const { bestSellingProducts, regionalDemand } = useMemo(() => {
        const deliveredOrders = orders.filter(o => o.status === 'delivered');

        // Calculate best-selling products
        const productSales = new Map<string, { product: any; count: number }>();
        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                const existing = productSales.get(item.product.id);
                if (existing) {
                    existing.count += item.quantity;
                } else {
                    productSales.set(item.product.id, {
                        product: item.product,
                        count: item.quantity,
                    });
                }
            });
        });
        const sortedProducts = Array.from(productSales.values()).sort((a, b) => b.count - a.count).slice(0, 5);

        // Calculate regional demand
        const stateDemand = new Map<string, number>();
        orders.forEach(order => {
            const state = order.shippingAddress.state;
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
            stateDemand.set(state, (stateDemand.get(state) || 0) + totalItems);
        });
        const sortedStates = Array.from(stateDemand.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name, total]) => ({ name, total }));
        
        return {
            bestSellingProducts: sortedProducts,
            regionalDemand: sortedStates,
        };

    }, [orders]);


  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tight">Marketing</h1>
            <p className="text-muted-foreground">Tools and strategies to grow your business.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="space-y-6">
                <CustomerExportForm />
                <CoachExportForm />
                <MembershipExportCard />
            </div>
            <div className="space-y-6">
                <BestSellingProductsCard products={bestSellingProducts} isLoading={loading} />
                <RegionalDemandChart data={regionalDemand} isLoading={loading} />
            </div>
        </div>

    </div>
  );
}

    