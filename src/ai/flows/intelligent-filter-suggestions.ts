'use server';

/**
 * @fileOverview Provides intelligent filter suggestions based on initial search inputs.
 *
 * - suggestFilters - A function that suggests relevant filters for company searches.
 * - SuggestFiltersInput - The input type for the suggestFilters function.
 * - SuggestFiltersOutput - The return type for the suggestFilters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFiltersInputSchema = z.object({
  initialInput: z
    .string()
    .describe(
      'The initial search input provided by the user, could be company name, technology or industry.'
    ),
  availableTechnologies: z.array(z.string()).describe('List of available technologies for filtering.'),
  availableCountries: z.array(z.string()).describe('List of available countries for filtering.'),
  availableIndustries: z.array(z.string()).describe('List of available industries for filtering.'),
});
export type SuggestFiltersInput = z.infer<typeof SuggestFiltersInputSchema>;

const SuggestFiltersOutputSchema = z.object({
  suggestedTechnologies: z
    .array(z.string())
    .describe('Suggested technologies based on the initial input.'),
  suggestedCountries: z
    .array(z.string())
    .describe('Suggested countries based on the initial input.'),
  suggestedIndustries: z
    .array(z.string())
    .describe('Suggested industries based on the initial input.'),
});
export type SuggestFiltersOutput = z.infer<typeof SuggestFiltersOutputSchema>;

export async function suggestFilters(input: SuggestFiltersInput): Promise<SuggestFiltersOutput> {
  return suggestFiltersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFiltersPrompt',
  input: {schema: SuggestFiltersInputSchema},
  output: {schema: SuggestFiltersOutputSchema},
  prompt: `Based on the user's initial search input and available filters, suggest the most relevant filters to narrow down the search.

Initial Input: {{{initialInput}}}

Available Technologies: {{#each availableTechnologies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Available Countries: {{#each availableCountries}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Available Industries: {{#each availableIndustries}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider the initial input and provide suggestions for technologies, countries, and industries that would be most helpful for the user to find the companies they are looking for. Only provide suggestions that are present in the list of available options.

Format your response as a JSON object with the following keys:
- suggestedTechnologies: An array of suggested technologies.
- suggestedCountries: An array of suggested countries.
- suggestedIndustries: An array of suggested industries.`,
});

const suggestFiltersFlow = ai.defineFlow(
  {
    name: 'suggestFiltersFlow',
    inputSchema: SuggestFiltersInputSchema,
    outputSchema: SuggestFiltersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
