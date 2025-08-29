
'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Customer } from '@/types';
import { getOrders, getTotalCostOfGoodsSold, getTotalRevenue } from './order-service';
import { getTotalExpenses } from './expense-service';

const ordersCollection = collection(db, 'orders');

/**
 * Fetches all orders and derives a unique list of customers.
 * @returns A promise that resolves to an array of unique customers.
 */
export async function getCustomers(): Promise<Customer[]> {
    const snapshot = await getDocs(ordersCollection);
    const orders = snapshot.docs.map(doc => doc.data() as Order);

    const uniqueCustomers = orders.reduce((acc, order) => {
        if (!acc.find(c => c.email === order.customer.email)) {
            acc.push(order.customer);
        }
        return acc;
    }, [] as Customer[]);

    return uniqueCustomers;
}

/**
 * Fetches all orders for a specific customer based on their email.
 * @param customerEmail The email of the customer.
 * @returns A promise that resolves to an array of orders.
 */
export async function getCustomerOrders(customerEmail: string): Promise<Order[]> {
    const q = query(ordersCollection, where('customer.email', '==', customerEmail));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    // Sort by date descending
    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return orders;
}


/**
 * Gathers all necessary statistics for the admin dashboard.
 * @returns A promise that resolves to an object with dashboard statistics.
 */
export async function getDashboardStats() {
    const [
        totalRevenue,
        totalCOGS,
        totalExpenses,
        allOrders
    ] = await Promise.all([
        getTotalRevenue(),
        getTotalCostOfGoodsSold(),
        getTotalExpenses(),
        getOrders()
    ]);

    const totalSales = allOrders.length;
    const netProfit = totalRevenue - totalCOGS - totalExpenses;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newCustomersThisMonth = allOrders
        .filter(order => new Date(order.date) >= startOfMonth)
        .reduce((acc, order) => {
            if (!acc.has(order.customer.email)) {
                acc.add(order.customer.email);
            }
            return acc;
        }, new Set<string>()).size;
        
    const recentOrders = allOrders.slice(0, 5);

    return {
        totalRevenue,
        totalSales,
        netProfit,
        newCustomersThisMonth,
        recentOrders
    };
}
