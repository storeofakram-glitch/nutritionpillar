
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where,getCountFromServer } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { ContactSubmission } from '@/types';
import { revalidatePath } from 'next/cache';

const contactSubmissionsCollection = collection(getDb(), 'contactSubmissions');

/**
 * Adds a new contact form submission to the database.
 * @param data The submission data from the form.
 * @returns An object indicating success or failure.
 */
export async function addSubmission(data: Omit<ContactSubmission, 'id' | 'createdAt' | 'status'>) {
    try {
        const newSubmission: Omit<ContactSubmission, 'id'> = {
            ...data,
            createdAt: new Date().toISOString(),
            status: 'new',
        };
        const docRef = await addDoc(contactSubmissionsCollection, newSubmission);
        revalidatePath('/admin/inbox');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding contact submission: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetches all contact submissions from the database, ordered by creation date.
 * @returns A promise that resolves to an array of contact submissions.
 */
export async function getSubmissions(): Promise<ContactSubmission[]> {
    const q = query(contactSubmissionsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactSubmission));
}

/**
 * Gets the count of unread ('new') contact submissions.
 * @returns A promise that resolves to the number of unread submissions.
 */
export async function getUnreadSubmissionsCount(): Promise<number> {
    try {
        const q = query(contactSubmissionsCollection, where('status', '==', 'new'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting unread submissions count: ", error);
        return 0;
    }
}


/**
 * Updates the status of a specific contact submission.
 * @param id The ID of the submission to update.
 * @param status The new status.
 * @returns An object indicating success or failure.
 */
export async function updateSubmissionStatus(id: string, status: ContactSubmission['status']) {
    try {
        const docRef = doc(getDb(), 'contactSubmissions', id);
        await updateDoc(docRef, { status });
        revalidatePath('/admin/inbox');
        return { success: true };
    } catch (error) {
        console.error("Error updating submission status: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Deletes a contact submission from the database.
 * @param id The ID of the submission to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteSubmission(id: string) {
    try {
        const docRef = doc(getDb(), 'contactSubmissions', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/inbox');
        return { success: true };
    } catch (error) {
        console.error("Error deleting submission: ", error);
        return { success: false, error: (error as Error).message };
    }
}
