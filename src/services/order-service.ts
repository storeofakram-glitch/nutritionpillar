
'use server';

import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types';
import { revalidatePath } from 'next/cache';

const ordersCollection = collection(db, 'orders');

export async function getOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orders;
}

export async function addOrder(order: Omit<Order, 'id'>) {
    try {
        const docRef = await addDoc(ordersCollection, order);
        revalidatePath('/admin/orders');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding order: ", error);
        return { success: false, error: (error as Error).message };
    }
}
