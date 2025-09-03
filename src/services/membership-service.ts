
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Membership, MembershipWithProducts, Product, RecommendedProduct } from '@/types';
import { revalidatePath } from 'next/cache';
import { getOrders } from './order-service';
import { getProductById } from './product-service';
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
 * @returns A promise that resolves to the membership details with products, or null if not found or expired.
 */
export async function findMembershipByCode(code: string): Promise<MembershipWithProducts | null> {
    const q = query(membershipsCollection, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const membershipDoc = snapshot.docs[0];
    const membershipData = { id: membershipDoc.id, ...membershipDoc.data() } as Membership;

    // Check if the membership has expired
    if (membershipData.expiresAt && new Date(membershipData.expiresAt) < new Date()) {
        console.log(`Membership ${membershipData.code} has expired.`);
        return null; // Treat expired memberships as invalid
    }

    // Fetch full product details for recommended products
    const recommendedProductsWithDetails: (RecommendedProduct & { product: Product })[] = [];
    if (membershipData.recommendedProducts && membershipData.recommendedProducts.length > 0) {
        const productPromises = membershipData.recommendedProducts.map(async (rec) => {
            const product = await getProductById(rec.productId);
            if (product) {
                return { ...rec, product };
            }
            return null;
        });
        const products = await Promise.all(productPromises);
        recommendedProductsWithDetails.push(...products.filter(p => p !== null) as (RecommendedProduct & { product: Product })[]);
    }
    
    // Omit the old structure and return the new one
    const { recommendedProducts, ...rest } = membershipData;

    return {
        ...rest,
        recommendedProducts: recommendedProductsWithDetails,
    };
}


/**
 * Adds a new membership document to the database.
 * @param membership The membership data to add.
 * @returns An object indicating success or failure.
 */
export async function addMembership(membership: Partial<Omit<Membership, 'id' | 'createdAt'>> & { membershipDurationDays?: number }) {
    try {
        const newMembership: Omit<Membership, 'id'> = {
            ...membership,
            type: membership.type || 'Coaching',
            code: membership.code || generateMembershipCode(),
            customerName: membership.customerName || '',
            goal: membership.goal || 'Not specified',
            recommendedProducts: membership.recommendedProducts || [],
            createdAt: new Date().toISOString(),
        };

        if (membership.membershipDurationDays && membership.membershipDurationDays > 0) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + membership.membershipDurationDays);
            newMembership.expiresAt = expiryDate.toISOString();
        }
        
        // Remove the temporary duration field before saving
        const { membershipDurationDays, ...finalMembership } = newMembership;

        const docRef = await addDoc(membershipsCollection, finalMembership);
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
                    recommendedProducts: [],
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
