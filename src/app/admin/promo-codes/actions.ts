'use server'

import { z } from 'zod'
import { promoCodes } from '@/lib/mock-data'
import type { PromoCode } from '@/types'

export async function generatePromoCode(prevState: { message: string, codes: PromoCode[] | null }, formData: FormData): Promise<{ message: string, codes: PromoCode[] | null }> {
  // This is a simplified example. In a real app, you would:
  // 1. Ensure the generated code is unique by checking the database.
  // 2. Save the new code to the database.

  try {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const discountType = Math.random() > 0.5 ? 'percentage' : 'fixed';
    let discountValue;

    if (discountType === 'percentage') {
      const percentages = [5, 10, 15, 20, 25];
      discountValue = percentages[Math.floor(Math.random() * percentages.length)];
    } else {
      const amounts = [10, 20, 50]; // Adjusted for more realistic fixed amounts
      discountValue = amounts[Math.floor(Math.random() * amounts.length)];
    }
    
    const newCode: PromoCode = {
      code: `FIT-${randomString}`,
      discount: discountValue,
      type: discountType,
      used: false,
    };
    
    console.log("Generated new promo code:", newCode);

    // In a real app, you'd add this to your database.
    // For this mock version, we'll just prepend it to the existing list.
    const updatedCodes = [newCode, ...promoCodes];

    return { message: "Successfully generated code.", codes: updatedCodes };
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred.";
    return { message: `Failed to generate code: ${message}`, codes: null };
  }
}
