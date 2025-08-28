'use server';

/**
 * @fileOverview Recommends a supplement stack based on user input.
 *
 * - supplementRecommendation - A function that handles the supplement recommendation process.
 * - SupplementRecommendationInput - The input type for the supplementRecommendation function.
 * - SupplementRecommendationOutput - The return type for the supplementRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupplementRecommendationInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  gender: z.string().describe('The gender of the user.'),
  fitnessGoals: z.string().describe('The fitness goals of the user.'),
  otherRequirements: z.string().describe('Any other requirements of the user.'),
});
export type SupplementRecommendationInput = z.infer<
  typeof SupplementRecommendationInputSchema
>;

const SupplementRecommendationOutputSchema = z.object({
  supplementStack: z
    .string()
    .describe('The recommended supplement stack for the user.'),
  explanation: z
    .string()
    .describe('The explanation of why the supplement stack is recommended.'),
});
export type SupplementRecommendationOutput = z.infer<
  typeof SupplementRecommendationOutputSchema
>;

export async function supplementRecommendation(
  input: SupplementRecommendationInput
): Promise<SupplementRecommendationOutput> {
  return supplementRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supplementRecommendationPrompt',
  input: {schema: SupplementRecommendationInputSchema},
  output: {schema: SupplementRecommendationOutputSchema},
  prompt: `You are an AI supplement recommendation expert.

You will use the following information to recommend a supplement stack for the user.

Age: {{{age}}}
Gender: {{{gender}}}
Fitness Goals: {{{fitnessGoals}}}
Other Requirements: {{{otherRequirements}}}

Recommend a supplement stack for the user, and explain why the supplement stack is recommended.`,
});

const supplementRecommendationFlow = ai.defineFlow(
  {
    name: 'supplementRecommendationFlow',
    inputSchema: SupplementRecommendationInputSchema,
    outputSchema: SupplementRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
