// This is a new file for the membership checking service.
'use server';

// This is a placeholder list of valid membership codes.
// In a real application, you would replace this with a database call
// or an API request to your coaching website's backend.
const VALID_CODES = ['GOLD2024', 'PRO123', 'ELITEFIT', 'AKRAMFIT', 'COACH'];

/**
 * Checks if a membership code is valid.
 * @param code The membership code to validate.
 * @returns A promise that resolves to an object with an `isValid` boolean.
 */
export async function checkMembership(code: string): Promise<{ isValid: boolean }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const isValid = VALID_CODES.includes(code.toUpperCase());
  
  return { isValid };
}
