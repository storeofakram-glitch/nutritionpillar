
'use server';

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, getDoc, runTransaction } from 'firebase/firestore';
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
        // Here we would get the coach's commission rate
        // For now, let's assume 70%
        const coachShare = payment.amount * 0.70;
        
        await runTransaction(getDb(), async (transaction) => {
            const newPayment: Omit<ClientPayment, 'id'> = { ...payment, coachShare };
            const newPaymentRef = doc(collection(getDb(), 'client_payments'));
            transaction.set(newPaymentRef, newPayment);
            
            // If payment is 'paid', update coach's pending payout
            if(payment.status === 'paid') {
                const coachFinRef = doc(getDb(), 'coach_financials', payment.coachId);
                const coachFinDoc = await transaction.get(coachFinRef);
                if (coachFinDoc.exists()) {
                    const currentPending = coachFinDoc.data().pendingPayout || 0;
                    transaction.update(coachFinRef, { pendingPayout: currentPending + coachShare });
                } else {
                     transaction.set(coachFinRef, { 
                        commissionRate: 70, // default
                        totalEarnings: 0,
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


// COACH PAYOUTS
export async function getCoachPayouts(): Promise<CoachPayout[]> {
    const snapshot = await getDocs(query(payoutsCollection(), orderBy('payoutDate', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachPayout));
}

export async function processPayout(payoutId: string) {
     try {
        await runTransaction(getDb(), async (transaction) => {
            const payoutRef = doc(getDb(), 'coach_payouts', payoutId);
            const payoutDoc = await transaction.get(payoutRef);

            if (!payoutDoc.exists() || payoutDoc.data().status !== 'pending') {
                throw new Error("Payout not found or not in pending state.");
            }
            const payoutData = payoutDoc.data() as Omit<CoachPayout, 'id'>;

            // Mark payout as completed
            transaction.update(payoutRef, { status: 'completed' });

            // Update coach's financial record
            const coachFinRef = doc(getDb(), 'coach_financials', payoutData.coachId);
            const coachFinDoc = await transaction.get(coachFinRef);
             if (!coachFinDoc.exists()) {
                throw new Error("Coach financial record not found.");
            }
            const currentPaidOut = coachFinDoc.data().paidOut || 0;
            const currentPending = coachFinDoc.data().pendingPayout || 0;
            const currentTotalEarnings = coachFinDoc.data().totalEarnings || 0;

            transaction.update(coachFinRef, {
                paidOut: currentPaidOut + payoutData.amount,
                pendingPayout: currentPending - payoutData.amount,
                totalEarnings: currentTotalEarnings + payoutData.amount
            });
        });

        revalidatePath('/admin/finance-coaching');
        return { success: true };
    } catch (error) {
        console.error("Error processing payout: ", error);
        return { success: false, error: (error as Error).message };
    }
}

