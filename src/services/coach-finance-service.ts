

'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, getDoc, runTransaction, where, writeBatch } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { CoachFinancials, ClientPayment, CoachPayout, Coach } from '@/types';
import { revalidatePath } from 'next/cache';

const financialsCollection = () => collection(getDb(), 'coach_financials');
const paymentsCollection = () => collection(getDb(), 'client_payments');
const payoutsCollection = () => collection(getDb(), 'coach_payouts');

// COACH FINANCIALS (Commissions)
export async function getCoachFinancials(): Promise<CoachFinancials[]> {
    const snapshot = await getDocs(query(financialsCollection()));
    return snapshot.docs.map(doc => ({ id: doc.id, coachId: doc.id, ...doc.data() } as CoachFinancials));
}

export async function getCoachFinancialsById(coachId: string): Promise<CoachFinancials | null> {
    try {
        const docRef = doc(getDb(), 'coach_financials', coachId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, coachId: docSnap.id, ...docSnap.data() } as CoachFinancials;
        }
        // Return a default object if no financials exist yet, so the dashboard doesn't break
        return {
            id: coachId,
            coachId,
            commissionRate: 70, // Default rate
            totalEarnings: 0,
            paidOut: 0,
            pendingPayout: 0,
        };
    } catch (error) {
        console.error("Error getting coach financials by ID: ", error);
        return null;
    }
}


export async function updateCoachCommission(coachId: string, commissionRate: number) {
    try {
        const docRef = doc(getDb(), 'coach_financials', coachId);
        await runTransaction(getDb(), async (transaction) => {
            const finDoc = await transaction.get(docRef);
            if (!finDoc.exists()) {
                 transaction.set(docRef, { 
                    commissionRate,
                    totalEarnings: 0,
                    paidOut: 0,
                    pendingPayout: 0,
                 });
            } else {
                transaction.update(docRef, { commissionRate });
            }
        });
        revalidatePath('/admin/finance-coaching');
        return { success: true };
    } catch (error) {
        console.error("Error updating coach commission: ", error);
        return { success: false, error: (error as Error).message };
    }
}


// CLIENT PAYMENTS
export async function getClientPayments(): Promise<ClientPayment[]> {
    const snapshot = await getDocs(query(paymentsCollection(), orderBy('paymentDate', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientPayment));
}

export async function addClientPayment(payment: Omit<ClientPayment, 'id' | 'coachShare'>) {
    try {
        const db = getDb();
        await runTransaction(db, async (transaction) => {
            const coachFinRef = doc(db, 'coach_financials', payment.coachId);
            const coachFinDoc = await transaction.get(coachFinRef);
            
            const commissionRate = coachFinDoc.exists() ? coachFinDoc.data().commissionRate : 70;
            const coachShare = payment.amount * (commissionRate / 100);

            // Create refs for the new documents first
            const newPaymentRef = doc(collection(db, 'client_payments'));
            const newPayoutRef = doc(collection(db, 'coach_payouts'));

            // Now, perform all write operations
            transaction.set(newPaymentRef, { ...payment, coachShare });

            if (payment.status === 'paid') {
                const newPayout: Omit<CoachPayout, 'id'> = {
                    coachId: payment.coachId,
                    clientPaymentId: newPaymentRef.id,
                    clientName: payment.clientName,
                    planTitle: payment.planTitle,
                    amount: coachShare,
                    payoutDate: new Date().toISOString(),
                    status: 'pending',
                    paymentMethod: 'other',
                };
                transaction.set(newPayoutRef, newPayout);
                
                if (coachFinDoc.exists()) {
                    const currentPending = coachFinDoc.data().pendingPayout || 0;
                    const currentTotal = coachFinDoc.data().totalEarnings || 0;
                    transaction.update(coachFinRef, { 
                        pendingPayout: currentPending + coachShare,
                        totalEarnings: currentTotal + coachShare,
                    });
                } else {
                     transaction.set(coachFinRef, { 
                        commissionRate: 70, // default
                        totalEarnings: coachShare,
                        paidOut: 0,
                        pendingPayout: coachShare,
                     });
                }
            }
        });

        revalidatePath('/admin/finance-coaching');
        return { success: true };
    } catch (error) {
        console.error("Error adding client payment: ", error);
        return { success: false, error: (error as Error).message };
    }
}


export async function deleteClientPayment(paymentId: string) {
    const db = getDb();
    try {
        await runTransaction(db, async (transaction) => {
            const paymentRef = doc(db, 'client_payments', paymentId);
            const paymentDoc = await transaction.get(paymentRef);

            if (!paymentDoc.exists()) {
                throw new Error("Payment record not found.");
            }
            
            // Fetch the corresponding payout document to delete it as well.
            // This is a read operation, so it must happen before writes.
            const payoutQuery = query(
                collection(db, 'coach_payouts'),
                where('clientPaymentId', '==', paymentId),
                where('status', '==', 'pending')
            );
            const payoutSnapshot = await getDocs(payoutQuery);
            const payoutDocToDelete = !payoutSnapshot.empty ? payoutSnapshot.docs[0] : null;


            const paymentData = paymentDoc.data() as ClientPayment;
            const { coachId, coachShare, status } = paymentData;
            
            // All read operations are done. Now perform writes.

            // Delete the payment itself
            transaction.delete(paymentRef);

            // If the payment was 'paid', we need to reverse the financial entries
            if (status === 'paid' && coachShare > 0) {
                const coachFinRef = doc(db, 'coach_financials', coachId);
                const coachFinDoc = await transaction.get(coachFinRef);

                if (coachFinDoc.exists()) {
                    const financials = coachFinDoc.data();
                    // Reverse the earnings
                    transaction.update(coachFinRef, {
                        totalEarnings: (financials.totalEarnings || 0) - coachShare,
                        pendingPayout: (financials.pendingPayout || 0) - coachShare,
                    });
                }

                // Also delete the corresponding 'pending' payout record if found
                if(payoutDocToDelete) {
                    transaction.delete(payoutDocToDelete.ref);
                }
            }
        });

        revalidatePath('/admin/finance-coaching');
        return { success: true };
    } catch (error) {
        console.error("Error deleting client payment: ", error);
        return { success: false, error: (error as Error).message };
    }
}



// COACH PAYOUTS
export async function getCoachPayouts(): Promise<CoachPayout[]> {
    const snapshot = await getDocs(query(payoutsCollection(), orderBy('payoutDate', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachPayout));
}

export async function getCoachPayoutsByCoachId(coachId: string): Promise<CoachPayout[]> {
    const q = query(collection(getDb(), 'coach_payouts'), where('coachId', '==', coachId));
    const snapshot = await getDocs(q);
    const payouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachPayout));
    
    payouts.sort((a, b) => new Date(b.payoutDate).getTime() - new Date(a.payoutDate).getTime());
    return payouts;
}


/**
 * Processes all pending payouts for a specific coach.
 * This marks all 'pending' payouts as 'completed' and updates the coach's financial summary.
 * @param coachId The ID of the coach whose payouts are to be processed.
 * @returns An object indicating success or failure.
 */
export async function processAllPendingPayoutsForCoach(coachId: string) {
    const db = getDb();
    try {
        // Use a transaction to ensure atomicity
        await runTransaction(db, async (transaction) => {
            // 1. Find all pending payouts for the coach
            const pendingPayoutsQuery = query(
                collection(db, 'coach_payouts'),
                where('coachId', '==', coachId),
                where('status', '==', 'pending')
            );
            
            // Note: getDocs cannot be used inside a transaction.
            // We fetch the documents outside and then use their refs inside.
            const pendingPayoutsSnapshot = await getDocs(pendingPayoutsQuery);

            if (pendingPayoutsSnapshot.empty) {
                // It's not an error to have no pending payouts, just nothing to do.
                return;
            }

            let totalPayoutAmount = 0;
            
            // 2. Prepare updates for each pending payout
            pendingPayoutsSnapshot.forEach(payoutDoc => {
                const payoutData = payoutDoc.data() as CoachPayout;
                totalPayoutAmount += payoutData.amount;
                transaction.update(payoutDoc.ref, { status: 'completed' });
            });
            
            // 3. Update the coach's aggregate financial record
            const coachFinRef = doc(db, 'coach_financials', coachId);
            const coachFinDoc = await transaction.get(coachFinRef);
            
            if (!coachFinDoc.exists()) {
                // This case should ideally not happen if a financial doc is created with the first payment
                throw new Error("Coach financial record not found during payout processing.");
            }

            const currentPaidOut = coachFinDoc.data().paidOut || 0;
            const currentPending = coachFinDoc.data().pendingPayout || 0;
            
            // Update the financials within the transaction
            transaction.update(coachFinRef, {
                pendingPayout: Math.max(0, currentPending - totalPayoutAmount),
                paidOut: currentPaidOut + totalPayoutAmount,
            });
        });

        revalidatePath('/admin/finance-coaching');
        revalidatePath('/membership');
        return { success: true };
    } catch (error) {
        console.error("Error processing all pending payouts: ", error);
        return { success: false, error: (error as Error).message };
    }
}
