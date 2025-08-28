'use server'

import { z } from 'zod'

export async function generatePromoCode(prevState: any, formData: FormData) {
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
      const amounts = [100, 200, 500, 1000];
      discountValue = amounts[Math.floor(Math.random() * amounts.length)];
    }
    
    const newCode = {
      code: `FIT-${randomString}`,
      discount: discountValue,
      type: discountType,
      used: false,
    };
    
    console.log("Generated new promo code:", newCode);

    return { message: "Successfully generated code.", code: newCode };
  } catch (e) {
    return { message: "Failed to generate code.", code: null };
  }
}
