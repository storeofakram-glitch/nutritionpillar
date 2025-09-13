
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CoachingApplication } from '@/types';
import { revalidatePath } from 'next/cache';
import { addMembership, findMembershipByApplicationId } from './membership-service';

const applicationsCollection = collection(db, 'coachingApplications');

/**
 * Adds a new coaching application to the database.
 * @param data The application data.
 * @returns An object indicating success or failure.
 */
export async function addApplication(data: Omit<CoachingApplication, 'id' | 'createdAt' | 'status'>) {
    try {
        const newApplication: Omit<CoachingApplication, 'id'> = {
            ...data,
            createdAt: new Date().toISOString(),
            status: 'new',
        };
        const docRef = await addDoc(applicationsCollection, newApplication);
        revalidatePath('/admin/coaches');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding coaching application: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetches all applications for a specific coach.
 * @param coachId The ID of the coach.
 * @returns A promise that resolves to an array of applications.
 */
export async function getApplicationsByCoach(coachId: string): Promise<CoachingApplication[]> {
    const q = query(applicationsCollection, where('coachId', '==', coachId));
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachingApplication));
    
    // Sort applications by date in descending order (newest first)
    applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return applications;
}


/**
 * Fetches all active applications for a specific coach.
 * @param coachId The ID of the coach.
 * @returns A promise that resolves to an array of active applications.
 */
export async function getActiveApplicationsByCoach(coachId: string): Promise<CoachingApplication[]> {
    const q = query(applicationsCollection, where('coachId', '==', coachId), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachingApplication));
    applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return applications;
}


/**
 * Gets the count of applications for a specific coach.
 * @param coachId The ID of the coach.
 * @returns A promise that resolves to the number of applications.
 */
export async function getApplicationsCountByCoach(coachId: string): Promise<number> {
     try {
        const q = query(applicationsCollection, where('coachId', '==', coachId));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting applications count: ", error);
        return 0;
    }
}


/**
 * Gets the count of new applications for a specific coach.
 * @param coachId The ID of the coach.
 * @returns A promise that resolves to the number of new applications.
 */
export async function getNewApplicationsCountByCoach(coachId: string): Promise<number> {
     try {
        const q = query(applicationsCollection, where('coachId', '==', coachId), where('status', '==', 'new'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting new applications count: ", error);
        return 0;
    }
}

/**
 * Updates the status of a specific application and creates a membership if status is 'active'.
 * @param id The ID of the application to update.
 * @param status The new status.
 * @returns An object indicating success or failure.
 */
export async function updateApplicationStatus(id: string, status: CoachingApplication['status']) {
    try {
        const docRef = doc(db, 'coachingApplications', id);
        await updateDoc(docRef, { status });

        // If the status is 'active', create a membership for the client
        if (status === 'active') {
            const appDoc = await getDocs(query(applicationsCollection, where('__name__', '==', id)));
            if (!appDoc.empty) {
                const application = appDoc.docs[0].data() as CoachingApplication;
                
                // Check if a membership already exists for this application
                const existingMembership = await findMembershipByApplicationId(id);

                if (!existingMembership) {
                    await addMembership({
                        applicationId: id,
                        customerName: application.applicant.name,
                        customerEmail: application.applicant.email,
                        customerPhone: application.applicant.phone,
                        coachingPlan: application.planTitle,
                        goal: application.applicant.goal,
                        type: 'Coaching',
                    });
                }
            }
        }

        revalidatePath('/admin/coaches');
        revalidatePath('/membership');
        return { success: true };
    } catch (error) {
        console.error("Error updating application status: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Deletes an application from the database.
 * @param id The ID of the application to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteApplication(id: string) {
    try {
        const docRef = doc(db, 'coachingApplications', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/coaches');
        return { success: true };
    } catch (error) {
        console.error("Error deleting application: ", error);
        return { success: false, error: (error as Error).message };
    }
}
