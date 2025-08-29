
'use server';

import { collection, getDocs, addDoc, query, orderBy, doc, runTransaction, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types';
import { revalidatePath } from 'next/cache';

const ordersCollection = collection(db, 'orders');
const counterDocRef = doc(db, 'counters', 'orders');

async function getNextOrderNumber(): Promise<number> {
    try {
        const orderNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterDocRef);
            
            if (!counterDoc.exists()) {
                // If counter doesn't exist, initialize it
                transaction.set(counterDocRef, { currentNumber: 1 });
                return 1;
            }
            
            const newNumber = counterDoc.data().currentNumber + 1;
            transaction.update(counterDocRef, { currentNumber: newNumber });
            return newNumber;
        });
        return orderNumber;
    } catch (e) {
        console.error("Transaction failed: ", e);
        // Fallback or error handling
        // For simplicity, we'll throw an error, but in production, you might want a retry mechanism
        throw new Error("Could not generate a new order number.");
    }
}


export async function getOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orders;
}

export async function addOrder(order: Omit<Order, 'id' | 'orderNumber'>) {
    try {
        const orderNumber = await getNextOrderNumber();
        const newOrderData = { ...order, orderNumber };
        const docRef = await addDoc(ordersCollection, newOrderData);

        revalidatePath('/admin/orders');
        revalidatePath('/admin/finance');
        return { success: true, id: docRef.id, orderNumber };
    } catch (error) {
        console.error("Error adding order: ", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getTotalRevenue(): Promise<number> {
    const snapshot = await getDocs(ordersCollection);
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    return totalRevenue;
}
