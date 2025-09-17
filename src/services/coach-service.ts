
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, getDoc, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { Coach } from '@/types';
import { revalidatePath } from 'next/cache';
import { addMembership } from './membership-service';

const coachesCollection = () => collection(getDb(), 'coaches');

/**
 * Fetches all coaches and experts from the database, ordered by creation date.
 * @returns A promise that resolves to an array of coaches/experts.
 */
export async function getCoaches(): Promise<Coach[]> {
    const q = query(coachesCollection(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coach));
}

/**
 * Fetches a single coach or expert by their ID.
 * @param id The ID of the coach/expert to fetch.
 * @returns A promise that resolves to the coach object or null if not found.
 */
export async function getCoachById(id: string): Promise<Coach | null> {
    try {
        const docRef = doc(getDb(), 'coaches', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Coach;
        }
        return null;
    } catch (error) {
        console.error("Error getting coach by ID: ", error);
        return null;
    }
}

/**
 * Fetches a single coach or expert by their name.
 * @param name The name of the coach/expert to fetch.
 * @returns A promise that resolves to the coach object or null if not found.
 */
export async function getCoachByName(name: string): Promise<Coach | null> {
    try {
        const q = query(coachesCollection(), where('name', '==', name));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() } as Coach;
        }
        return null;
    } catch (error) {
        console.error("Error getting coach by name: ", error);
        return null;
    }
}


/**
 * Adds a new coach or expert document to the database and creates a corresponding membership.
 * @param coach The coach/expert data to add.
 * @returns An object indicating success or failure.
 */
export async function addCoach(coach: Omit<Coach, 'id' | 'createdAt'>) {
    try {
        const newCoach: Omit<Coach, 'id'> = {
            ...coach,
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(coachesCollection(), newCoach);

        // After successfully adding the coach, create a membership for them.
        await addMembership({
            customerName: coach.name,
            coachingPlan: coach.specialty, // Use specialty as the plan name
            type: 'Coach/Expert',
        });
        
        revalidatePath('/admin/coaches');
        revalidatePath('/');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding coach: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Updates an existing coach or expert document.
 * @param id The ID of the coach/expert to update.
 * @param data The partial data to update.
 * @returns An object indicating success or failure.
 */
export async function updateCoach(id: string, data: Partial<Omit<Coach, 'id' | 'createdAt'>>) {
    try {
        const docRef = doc(getDb(), 'coaches', id);
        await updateDoc(docRef, data);
        revalidatePath('/admin/coaches');
        revalidatePath('/');
        revalidatePath(`/coaches/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating coach: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Deletes a coach or expert from the database.
 * @param id The ID of the coach/expert to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteCoach(id: string) {
    try {
        const docRef = doc(getDb(), 'coaches', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/coaches');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Error deleting coach: ", error);
        return { success: false, error: (error as Error).message };
    }
}
