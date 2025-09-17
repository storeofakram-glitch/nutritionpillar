
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { ShippingState } from '@/types';
import { revalidatePath } from 'next/cache';

const shippingOptionsCollection = () => collection(getDb(), 'shippingOptions');

export async function getShippingOptions(): Promise<ShippingState[]> {
    const snapshot = await getDocs(shippingOptionsCollection());
    const options = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShippingState));
    // Sort by state name
    options.sort((a, b) => a.state.localeCompare(b.state));
    return options;
}

export async function addShippingOption(option: Omit<ShippingState, 'id'>) {
    try {
        const docRef = await addDoc(shippingOptionsCollection(), option);
        revalidatePath('/admin/shipping');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding shipping option: ", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateShippingOption(id: string, option: Partial<Omit<ShippingState, 'id'>>) {
    try {
        const docRef = doc(getDb(), 'shippingOptions', id);
        await updateDoc(docRef, option);
        revalidatePath('/admin/shipping');
        return { success: true };
    } catch (error) {
        console.error("Error updating shipping option: ", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteShippingOption(id: string) {
    try {
        const docRef = doc(getDb(), 'shippingOptions', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/shipping');
        return { success: true };
    } catch (error) {
        console.error("Error deleting shipping option: ", error);
        return { success: false, error: (error as Error).message };
    }
}
