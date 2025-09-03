
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Membership, MembershipWithProducts, Order, Product } from '@/types';
import { revalidatePath } from 'next/cache';
import { getOrders } from './order-service';
import { getProductById, getProducts } from './product-service';
import { randomBytes } from 'crypto';

const membershipsCollection = collection(db, 'memberships');

/**
 * Generates a random, uppercase, 8-character alphanumeric code.
 * @returns A unique membership code.
 */
function generateMembershipCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}


/**
 * Fetches all memberships from the database, ordered by creation date.
 * @returns A promise that resolves to an array of memberships.
 */
export async function getMemberships(): Promise<Membership[]> {
    const snapshot = await getDocs(query(membershipsCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Membership));
}

/**
 * Finds a membership by its unique code and fetches the details of recommended products.
 * @param code The membership code to find.
 * @returns A promise that resolves to the membership details with products, or null if not found.
 */
export async function findMembershipByCode(code: string): Promise<MembershipWithProducts | null> {
    const q = query(membershipsCollection, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const membershipDoc = snapshot.docs[0];
    const membershipData = { id: membershipDoc.id, ...membershipDoc.data() } as Membership;

    // Fetch full product details for recommended products
    const recommendedProducts: Product[] = [];
    if (membershipData.recommendedProductIds && membershipData.recommendedProductIds.length > 0) {
        const productPromises = membershipData.recommendedProductIds.map(id => getProductById(id));
        const products = await Promise.all(productPromises);
        recommendedProducts.push(...products.filter(p => p !== null) as Product[]);
    }

    // Omit recommendedProductIds and add recommendedProducts
    const { recommendedProductIds, ...rest } = membershipData;

    return {
        ...rest,
        recommendedProducts: recommendedProducts,
    };
}


/**
 * Adds a new membership document to the database.
 * @param membership The membership data to add.
 * @returns An object indicating success or failure.
 */
export async function addMembership(membership: Partial<Omit<Membership, 'id' | 'createdAt'>>) {
    try {
        const newMembership: Omit<Membership, 'id'> = {
            ...membership,
            type: membership.type || 'Coaching',
            code: membership.code || generateMembershipCode(),
            customerName: membership.customerName || '',
            goal: membership.goal || 'Not specified',
            recommendedProductIds: membership.recommendedProductIds || [],
            createdAt: new Date().toISOString(),
        }
        const docRef = await addDoc(membershipsCollection, newMembership);
        revalidatePath('/admin/membership');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding membership: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Updates an existing membership document.
 * @param id The ID of the membership to update.
 * @param data The partial data to update.
 * @returns An object indicating success or failure.
 */
export async function updateMembership(id: string, data: Partial<Omit<Membership, 'id'>>) {
    try {
        const docRef = doc(db, 'memberships', id);
        await updateDoc(docRef, data);
        revalidatePath('/admin/membership');
        return { success: true };
    } catch (error) {
        console.error("Error updating membership: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Deletes a membership from the database.
 * @param id The ID of the membership to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteMembership(id: string) {
    try {
        const docRef = doc(db, 'memberships', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/membership');
        return { success: true };
    } catch (error) {
        console.error("Error deleting membership: ", error);
        return { success: false, error: (error as Error).message };
    }
}


/**
 * Checks all delivered orders and creates loyalty memberships for eligible customers.
 * Customers with 5 or more delivered orders who do not already have a membership will get one.
 * @returns A summary of the operation.
 */
export async function generateLoyaltyMemberships(): Promise<{ success: boolean; newMemberships: number; error?: string }> {
    try {
        const [orders, existingMemberships] = await Promise.all([
            getOrders(),
            getMemberships(),
        ]);

        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        
        // Count delivered orders per customer
        const orderCounts = deliveredOrders.reduce((acc, order) => {
            const email = order.customer.email.toLowerCase();
            acc[email] = (acc[email] || { count: 0, name: order.customer.name });
            acc[email].count += 1;
            return acc;
        }, {} as Record<string, { count: number; name: string }>);

        const existingMemberEmails = new Set(existingMemberships.map(m => m.customerEmail?.toLowerCase()).filter(Boolean));
        let newMembershipsCount = 0;

        for (const email in orderCounts) {
            const customer = orderCounts[email];
            if (customer.count >= 5 && !existingMemberEmails.has(email)) {
                // This customer is eligible and doesn't have a membership yet
                const newMembership: Omit<Membership, 'id'> = {
                    type: 'Fitness Pillar',
                    code: generateMembershipCode(),
                    customerName: customer.name,
                    customerEmail: email,
                    recommendedProductIds: [],
                    createdAt: new Date().toISOString(),
                };
                await addDoc(membershipsCollection, newMembership);
                newMembershipsCount++;
            }
        }
        
        if (newMembershipsCount > 0) {
            revalidatePath('/admin/membership');
        }

        return { success: true, newMemberships: newMembershipsCount };

    } catch (error) {
        console.error("Error generating loyalty memberships: ", error);
        return { success: false, newMemberships: 0, error: (error as Error).message };
    }
}
