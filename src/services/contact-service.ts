
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ContactSubmission } from '@/types';
import { revalidatePath } from 'next/cache';

const contactSubmissionsCollection = collection(db, 'contactSubmissions');

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
 * Updates the status of a specific contact submission.
 * @param id The ID of the submission to update.
 * @param status The new status.
 * @returns An object indicating success or failure.
 */
export async function updateSubmissionStatus(id: string, status: ContactSubmission['status']) {
    try {
        const docRef = doc(db, 'contactSubmissions', id);
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
        const docRef = doc(db, 'contactSubmissions', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/inbox');
        return { success: true };
    } catch (error) {
        console.error("Error deleting submission: ", error);
        return { success: false, error: (error as Error).message };
    }
}
