
'use server';

/**
 * @fileOverview Translates a natural language query into structured search filters.
 *
 * - naturalLanguageToFilters - A function that converts a natural language string into a filter object.
 * - NaturalLanguageToFiltersInput - The input type for the naturalLanguageToFilters function.
 * - NaturalLanguageToFiltersOutput - The return type for the naturalLanguageToFilters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const technologySchema = z.object({
  value: z.string(),
  condition: z.enum(['AND', 'OR', 'NOT']),
});

const NaturalLanguageToFiltersInputSchema = z.object({
    query: z.string().describe('The natural language search query from the user.'),
    availableTechnologies: z.array(z.string()).describe('List of available technologies for filtering.'),
    availableCountries: z.array(z.string()).describe('List of available countries for filtering.'),
    availableIndustries: z.array(z.string()).describe('List of available industries for filtering.'),
    availableOfficeLocations: z.array(z.string()).describe('List of available office locations for filtering.'),
});
export type NaturalLanguageToFiltersInput = z.infer<typeof NaturalLanguageToFiltersInputSchema>;


const NaturalLanguageToFiltersOutputSchema = z.object({
  search: z.string().optional().describe('General search term.'),
  industries: z.array(z.string()).describe('Selected industries.'),
  countries: z.array(z.string()).describe('Selected countries.'),
  officeLocations: z.array(z.string()).describe('Selected office locations.'),
  technologies: z.array(technologySchema).describe('Selected technologies with conditions.'),
  techCount: z.tuple([z.number(), z.number()]).describe('A range for the number of technologies (min, max).'),
});
export type NaturalLanguageToFiltersOutput = z.infer<typeof NaturalLanguageToFiltersOutputSchema>;


export async function naturalLanguageToFilters(input: NaturalLanguageToFiltersInput): Promise<NaturalLanguageToFiltersOutput> {
    return naturalLanguageToFiltersFlow(input);
}

const prompt = ai.definePrompt({
    name: 'naturalLanguageToFiltersPrompt',
    input: {schema: NaturalLanguageToFiltersInputSchema},
    output: {schema: NaturalLanguageToFiltersOutputSchema},
    prompt: `You are an expert at converting natural language search queries into structured JSON filters for a company database.
Analyze the user's query and the available filter options to generate the correct JSON output.

User Query: "{{query}}"

Available Filter Options:
- Industries: {{#each availableIndustries}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Countries: {{#each availableCountries}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Technologies: {{#each availableTechnologies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Office Locations: {{#each availableOfficeLocations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Your Task:
1.  **Extract Filters**: Identify industries, countries, office locations, and technologies mentioned in the query. Only use values present in the "Available Filter Options".
2.  **Determine Technology Logic**:
    - "AND": Use for queries like "uses React and Node.js". The company must use all specified technologies.
    - "OR": Use for queries like "uses React or Angular". The company can use any one of the specified technologies.
    - "NOT": Use for queries like "all but Java" or "not Java". The company must not use the specified technology.
    - **Default to "AND" if the logic is ambiguous or not specified.** For "React, Node.js", assume "React AND Node.js".
3.  **Extract Tech Stack Size**:
    - Look for phrases like "more than 10 technologies", "at least 5 techs", "less than 8 technologies", "between 5 and 10".
    - Set the \`techCount\` tuple accordingly. The first value is the minimum, the second is the maximum.
    - If only a minimum is specified (e.g., "more than 10"), set the maximum to a high number like 50.
    - If only a maximum is specified (e.g., "less than 8"), set the minimum to 0.
    - If not specified, the default is [0, 50].
4.  **Identify General Search Term**: If parts of the query don't map to a specific filter (e.g., a company name like "Innovate Inc."), put that in the \`search\` field.
5.  **Construct JSON Output**: Return a JSON object matching the required output schema.

Example 1 (AND and NOT):
Query: "Show me tech companies in the USA with an office in New York, using React but not Java, with at least 5 technologies"
Output:
{
  "search": "",
  "industries": ["Technology"],
  "countries": ["USA"],
  "officeLocations": ["New York"],
  "technologies": [
    { "value": "React", "condition": "AND" },
    { "value": "Java", "condition": "NOT" }
  ],
  "techCount": [5, 50]
}

Example 2 (OR):
Query: "Find companies in Germany that use Python or Java"
Output:
{
  "search": "",
  "industries": [],
  "countries": ["Germany"],
  "officeLocations": [],
  "technologies": [
    { "value": "Python", "condition": "OR" },
    { "value": "Java", "condition": "OR" }
  ],
  "techCount": [0, 50]
}

Example 3 (AND and OR):
Query: "Companies in the UK that use (React or Angular) and also AWS"
Output:
{
  "search": "",
  "industries": [],
  "countries": ["UK"],
  "officeLocations": [],
  "technologies": [
    { "value": "React", "condition": "OR" },
    { "value": "Angular", "condition": "OR" },
    { "value": "AWS", "condition": "AND" }
  ],
  "techCount": [0, 50]
}

Now, process the user's query.`,
});


const naturalLanguageToFiltersFlow = ai.defineFlow(
    {
      name: 'naturalLanguageToFiltersFlow',
      inputSchema: NaturalLanguageToFiltersInputSchema,
      outputSchema: NaturalLanguageToFiltersOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
