
'use server';

import { collection, addDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

type TeamApplicationData = {
    name: string;
    email: string;
    phone: string;
    position: 'Coach' | 'Expert';
    specialty: string;
    resumeUrl?: string;
    message: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    countryCode?: string;
}

/**
 * Adds a new team application submission to the database.
 * @param data The submission data from the form.
 * @returns An object indicating success or failure.
 */
export async function addTeamApplication(data: TeamApplicationData) {
    try {
        const newApplication = {
            ...data,
            createdAt: new Date().toISOString(),
            status: 'new', // You can use this status to track applications in an admin panel later
        };
        const docRef = await addDoc(teamApplicationsCollection(), newApplication);
        
        // This won't do much now, but will be useful if you build an admin view for these applications
        revalidatePath('/admin/team-applications'); 

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding team application: ", error);
        return { success: false, error: (error as Error).message };
    }
}

const teamApplicationsCollection = () => collection(getDb(), 'teamApplications');
