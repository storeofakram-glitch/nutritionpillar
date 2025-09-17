// This is a new file for managing site settings in Firestore.
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { SiteSettings } from '@/types';
import { revalidatePath } from 'next/cache';

const settingsDocRef = doc(getDb(), 'settings', 'homepage');

/**
 * Fetches the site settings from Firestore.
 * @returns A promise that resolves to the site settings object or null if not found.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as SiteSettings;
        }
        console.log("No site settings document found. Returning null.");
        return null;
    } catch (error) {
        console.error("Error fetching site settings: ", error);
        return null;
    }
}

/**
 * Saves the site settings to Firestore.
 * @param settings The site settings object to save.
 * @returns An object indicating success or failure.
 */
export async function saveSiteSettings(settings: SiteSettings) {
    try {
        await setDoc(settingsDocRef, settings, { merge: true });
        // Revalidate all relevant paths to show changes immediately
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/faq');
        revalidatePath('/terms-of-service');
        revalidatePath('/privacy-policy');
        return { success: true };
    } catch (error) {
        console.error("Error saving site settings: ", error);
        return { success: false, error: (error as Error).message };
    }
}
