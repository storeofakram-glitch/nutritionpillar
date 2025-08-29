
'use server';

import { collection, getDocs, addDoc, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Expense } from '@/types';
import { revalidatePath } from 'next/cache';

const expensesCollection = collection(db, 'expenses');

/**
 * Fetches all expenses from the database, ordered by date descending.
 * @returns A promise that resolves to an array of expenses.
 */
export async function getExpenses(): Promise<Expense[]> {
    const q = query(expensesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    return expenses;
}

/**
 * Adds a new expense document to the database.
 * @param expense The expense data to add.
 * @returns An object indicating success or failure.
 */
export async function addExpense(expense: Omit<Expense, 'id'>) {
    try {
        const docRef = await addDoc(expensesCollection, expense);
        revalidatePath('/admin/finance');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding expense: ", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Deletes an expense from the database.
 * @param id The ID of the expense to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteExpense(id: string) {
    try {
        const docRef = doc(db, 'expenses', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/finance');
        return { success: true };
    } catch (error) {
        console.error("Error deleting expense: ", error);
        return { success: false, error: (error as Error).message };
    }
}


/**
 * Calculates the total sum of all expenses.
 * @returns A promise that resolves to the total expense amount.
 */
export async function getTotalExpenses(): Promise<number> {
    const snapshot = await getDocs(expensesCollection);
    const expenses = snapshot.docs.map(doc => doc.data() as Expense);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return totalExpenses;
}
