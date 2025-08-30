
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types';
import { revalidatePath } from 'next/cache';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(productsCollection);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return products;
}

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
    } catch (error) {
        console.error("Error getting product by ID: ", error);
        return null;
    }
}


export async function addProduct(product: Omit<Product, 'id'>) {
    try {
        const docRef = await addDoc(productsCollection, product);
        // Revalidate all relevant paths after adding a product
        revalidatePath('/');
        revalidatePath('/admin/products');
        revalidatePath('/admin/finance');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding product: ", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id'>>) {
    try {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, product);
        // Revalidate all relevant paths after updating a product
        revalidatePath('/');
        revalidatePath('/admin/products');
        revalidatePath('/admin/finance');
        return { success: true };
    } catch (error) {
        console.error("Error updating product: ", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteProduct(id: string) {
    try {
        const docRef = doc(db, 'products', id);
        await deleteDoc(docRef);
        // Revalidate all relevant paths after deleting a product
        revalidatePath('/');
        revalidatePath('/admin/products');
        revalidatePath('/admin/finance');
        return { success: true };
    } catch (error) {
        console.error("Error deleting product: ", error);
        return { success: false, error: (error as Error).message };
    }
}
