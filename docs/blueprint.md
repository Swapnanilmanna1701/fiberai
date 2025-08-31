# **App Name**: TechStack Explorer

## Core Features:

- Technology Search: Enable users to search for companies based on technologies used, with dropdowns for technology selection featuring typeahead and fuzzy search to handle misspellings.
- Boolean Logic Search: Support AND, OR, and NOT operators for refining technology searches (e.g., 'Shopify OR Stripe, but NOT Intercom'). The application will generate a javascript function to accomplish the search.
- Metadata Search: Allow users to search by company metadata, including name, domain, category, and headquarters country. These fields should include dropdown menus, and typeahead.
- Company Statistics Search: Enable searching based on overall company stats, such as the total number of technologies used and the number of technologies per category. These numeric inputs will have ranges for searching.
- Intelligent Filter Selection Tool: Employ a tool powered by generative AI to suggest relevant filters based on initial search inputs, enhancing search efficiency and discovery.
- Results Table Display: Display search results in a sortable and filterable table, including company name, domain name, headquarters, revenue, number of employees, list of technologies used, and major office locations.
- CSV Export: Enable users to export search results as a CSV file for offline analysis and reporting.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) for a modern, tech-oriented feel.
- Background color: Very light purple (#F3E5F5), almost white, to provide a clean and spacious feel.
- Accent color: Light indigo (#9575CD) to highlight interactive elements and CTAs.
- Body and headline font: 'Inter', sans-serif, for a modern, readable interface. Inter is suitable for both headlines and body text.
- Implement a sidebar layout for filter options and a main section for displaying search results, as per the user-provided design.
- Use clean, minimalist icons to represent different technology categories and filter options.
- Incorporate subtle animations for loading states and filter transitions to enhance user experience.