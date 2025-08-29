'use server'

import { z } from 'zod'
import type { PromoCode } from '@/types'

// This is a simplified example. In a real app, you would:
// 1. Ensure the generated code is unique by checking the database.
// 2. Save the new code to the database.
export async function generatePromoCode(): Promise<PromoCode> {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const discountType = Math.random() > 0.5 ? 'percentage' : 'fixed';
  let discountValue;

  if (discountType === 'percentage') {
    const percentages = [5, 10, 15, 20, 25];
    discountValue = percentages[Math.floor(Math.random() * percentages.length)];
  } else {
    const amounts = [10, 20, 50];
    discountValue = amounts[Math.floor(Math.random() * amounts.length)];
  }
  
  const newCode: PromoCode = {
    code: `FIT-${randomString}`,
    discount: discountValue,
    type: discountType,
    used: false,
  };
  
  console.log("Generated new promo code:", newCode);

  // In a real app, you'd save this to your database.
  // We are just returning it to the client.
  return newCode;
}
