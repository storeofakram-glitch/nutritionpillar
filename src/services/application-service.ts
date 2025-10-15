

'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getCountFromServer, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { CoachingApplication } from '@/types';
import { revalidatePath } from 'next/cache';
import { addMembership, findMembershipByApplicationId } from './membership-service';
import { addClientPayment } from './coach-finance-service';
import { getCoachById } from './coach-service';

const applicationsCollection = () => collection(getDb(), 'coachingApplications');

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
        const docRef = await addDoc(applicationsCollection(), newApplication);
        revalidatePath('/admin/coaches');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding coaching application: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetches all applications from the database, ordered by creation date.
 * @returns A promise that resolves to an array of applications.
 */
export async function getAllApplications(): Promise<CoachingApplication[]> {
    const q = query(applicationsCollection(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachingApplication));
    return applications;
}


/**
 * Fetches all applications for a specific coach.
 * @param coachId The ID of the coach.
 * @returns A promise that resolves to an array of applications.
 */
export async function getApplicationsByCoach(coachId: string): Promise<CoachingApplication[]> {
    const q = query(applicationsCollection(), where('coachId', '==', coachId));
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
    const q = query(applicationsCollection(), where('coachId', '==', coachId), where('status', '==', 'active'));
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
        const q = query(applicationsCollection(), where('coachId', '==', coachId));
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
        const q = query(applicationsCollection(), where('coachId', '==', coachId), where('status', '==', 'new'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting new applications count: ", error);
        return 0;
    }
}


/**
 * Gets the count of all new coaching applications.
 * @returns A promise that resolves to the number of new applications.
 */
export async function getNewApplicationsCount(): Promise<number> {
     try {
        const q = query(applicationsCollection(), where('status', '==', 'new'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting new applications count: ", error);
        return 0;
    }
}


/**
 * Updates the status of a specific application and creates a membership and payment record if status is 'active'.
 * If the status is 'rejected', the application is deleted.
 * @param id The ID of the application to update.
 * @param status The new status.
 * @returns An object indicating success or failure.
 */
export async function updateApplicationStatus(id: string, status: CoachingApplication['status']) {
    try {
        const db = getDb();
        const docRef = doc(db, 'coachingApplications', id);

        if (status === 'rejected') {
            await deleteDoc(docRef);
        } else {
             // If the status is 'active', create related records
            if (status === 'active') {
                const appDoc = await getDoc(docRef);
                if (appDoc.exists()) {
                    const application = { id: appDoc.id, ...appDoc.data() } as CoachingApplication;
                    
                    const existingMembership = await findMembershipByApplicationId(id);

                    if (!existingMembership) {
                        let durationInDays = 0;
                        switch (application.applicant.duration) {
                            case '1 month': durationInDays = 30; break;
                            case '3 months': durationInDays = 90; break;
                            case '6 months': durationInDays = 180; break;
                            case '1 year': durationInDays = 365; break;
                        }

                        // Create membership
                        await addMembership({
                            applicationId: id,
                            customerName: application.applicant.name,
                            customerEmail: application.applicant.email,
                            customerPhone: application.applicant.phone,
                            coachingPlan: application.planTitle,
                            coachName: application.coachName,
                            goal: application.applicant.goal,
                            type: 'Coaching',
                            membershipDurationDays: durationInDays
                        });
                        
                        // Create a "paid" payment record
                        const coach = await getCoachById(application.coachId);
                        const plan = coach?.plans?.find(p => p.title === application.planTitle);
                        const planPrice = plan?.price || 0;
                        
                        let totalPrice = planPrice;
                        if (plan?.pricePeriod === 'month') {
                            const durationMap: Record<string, number> = {
                                '1 month': 1,
                                '3 months': 3,
                                '6 months': 6,
                                '1 year': 12,
                            };
                             const discountMap: Record<string, number | undefined> = {
                                '3 months': plan.discount3Months,
                                '6 months': plan.discount6Months,
                                '1 year': plan.discount1Year,
                            };
                            const multiplier = durationMap[application.applicant.duration] || 1;
                            const basePrice = planPrice * multiplier;

                            const discountPercentage = discountMap[application.applicant.duration];
                            if (discountPercentage && discountPercentage > 0) {
                                const discount = basePrice * (discountPercentage / 100);
                                totalPrice = basePrice - discount;
                            } else {
                                totalPrice = basePrice;
                            }
                        }


                        if (totalPrice > 0) {
                            await addClientPayment({
                                clientId: application.id,
                                clientName: application.applicant.name,
                                coachId: application.coachId,
                                coachName: application.coachName,
                                planTitle: application.planTitle,
                                amount: totalPrice,
                                paymentDate: new Date().toISOString(),
                                status: 'paid',
                            });
                        }
                    }
                }
            }
             await updateDoc(docRef, { status });
        }

        revalidatePath('/admin/coaches');
        revalidatePath('/membership');
        revalidatePath('/admin/finance-coaching');
        return { success: true };
    } catch (error) {
        console.error("Error updating application status: ", error);
        return { success: false, error: (error as Error).message };
    }
}


/**
 * Updates the plan URLs for a specific application.
 * @param id The ID of the application to update.
 * @param plans An object containing the nutrition and training plan URLs.
 * @returns An object indicating success or failure.
 */
export async function updateApplicationPlans(id: string, plans: { nutritionPlanUrl?: string; trainingPlanUrl?: string; }) {
    try {
        const docRef = doc(getDb(), 'coachingApplications', id);
        
        // Firestore requires dot notation for updating nested objects
        const updateData = {
            'applicant.nutritionPlanUrl': plans.nutritionPlanUrl || '',
            'applicant.trainingPlanUrl': plans.trainingPlanUrl || '',
        };

        await updateDoc(docRef, updateData);

        revalidatePath('/membership');
        return { success: true };
    } catch (error) {
        console.error("Error updating application plans: ", error);
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
        const docRef = doc(getDb(), 'coachingApplications', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/coaches');
        return { success: true };
    } catch (error) {
        console.error("Error deleting application: ", error);
        return { success: false, error: (error as Error).message };
    }
}
