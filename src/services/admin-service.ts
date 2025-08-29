
'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Customer } from '@/types';

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
