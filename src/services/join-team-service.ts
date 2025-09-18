
'use server';

import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export type TeamApplicationData = {
    id: string;
    name: string;
    email: string;
    age: number;
    phone: string;
    position: 'Coach' | 'Expert';
    specialty: string;
    certifications?: string[];
    resumeUrl?: string;
    message?: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    countryCode?: string;
    createdAt: string;
    status: 'new' | 'read' | 'contacted' | 'rejected';
}

const teamApplicationsCollection = () => collection(getDb(), 'teamApplications');

/**
 * Adds a new team application submission to the database.
 * @param data The submission data from the form.
 * @returns An object indicating success or failure.
 */
export async function addTeamApplication(data: Omit<TeamApplicationData, 'id' | 'createdAt' | 'status'>) {
    try {
        const newApplication = {
            ...data,
            createdAt: new Date().toISOString(),
            status: 'new' as const,
        };
        const docRef = await addDoc(teamApplicationsCollection(), newApplication);
        
        revalidatePath('/admin/team-management'); 

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding team application: ", error);
        return { success: false, error: (error as Error).message };
    }
}


/**
 * Fetches all team applications from the database, ordered by creation date.
 * @returns A promise that resolves to an array of team applications.
 */
export async function getTeamApplications(): Promise<TeamApplicationData[]> {
    try {
        const q = query(teamApplicationsCollection(), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamApplicationData));
    } catch (error) {
        console.error("Error fetching team applications: ", error);
        return [];
    }
}
