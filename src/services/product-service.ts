'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types';
import { revalidatePath } from 'next/cache';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(productsCollection);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return products;
}

export async function addProduct(product: Omit<Product, 'id'>) {
    try {
        const docRef = await addDoc(productsCollection, product);
        revalidatePath('/admin/products');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding product: ", error);
        return { success: false, error: (error as Error).message };
    }
}
