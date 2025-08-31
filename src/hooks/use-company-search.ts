
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Company } from '@/lib/data';
import type { z } from 'zod';
import type { FiltersSchema } from '@/components/search-sidebar';
import MiniSearch from 'minisearch';

export function useCompanySearch(allCompanies: Company[]) {
  const [results, setResults] = useState<Company[]>(allCompanies);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch<Company>({
      fields: ['name', 'domain', 'industry', 'technologies', 'hq_country', 'office_locations'],
      storeFields: ['id'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
      },
    });
    search.addAll(allCompanies);
    return search;
  }, [allCompanies]);

  const search = useCallback((filters: z.infer<typeof FiltersSchema>) => {
    let filteredCompanies: Company[];

    if (filters.search) {
      const searchResult = miniSearch.search(filters.search);
      const resultMap = new Map(allCompanies.map(c => [c.id, c]));
      filteredCompanies = searchResult.map(res => resultMap.get(res.id)!).filter(Boolean);
    } else {
      filteredCompanies = [...allCompanies];
    }
    
    const furtherFiltered = filteredCompanies.filter(company => {
        // Industry filter
        if (filters.industries.length > 0 && !filters.industries.includes(company.industry)) {
          return false;
        }

        // Country filter
        if (filters.countries.length > 0 && !filters.countries.includes(company.hq_country)) {
          return false;
        }

        // Office Location filter
        if (filters.officeLocations.length > 0 && !filters.officeLocations.some(loc => company.office_locations.includes(loc))) {
          return false;
        }

        // Revenue filter (in millions)
        const companyRevenueMillions = company.revenue / 1_000_000;
        if (filters.minRevenue !== undefined && companyRevenueMillions < filters.minRevenue) {
          return false;
        }
        if (filters.maxRevenue !== undefined && companyRevenueMillions > filters.maxRevenue) {
          return false;
        }
        
        // Technology count filter
        if (company.technologies.length < filters.techCount[0] || company.technologies.length > filters.techCount[1]) {
          return false;
        }
        
        // Office location count filter
        if (company.office_locations.length < filters.officeLocationCount[0] || company.office_locations.length > filters.officeLocationCount[1]) {
          return false;
        }

        // Technology boolean logic
        const techFilters = filters.technologies;
        if (techFilters.length > 0) {
          const andTechs = techFilters.filter((t) => t.condition === 'AND').map((t) => t.value);
          const orTechs = techFilters.filter((t) => t.condition === 'OR').map((t) => t.value);
          const notTechs = techFilters.filter((t) => t.condition === 'NOT').map((t) => t.value);
          
          // Handle NOT conditions: company must not have any of these
          if (notTechs.some((tech) => company.technologies.includes(tech))) {
            return false;
          }
          
          // Handle AND conditions: company must have all of these
          const hasAllAnds = andTechs.every((tech) => company.technologies.includes(tech));
          if (andTechs.length > 0 && !hasAllAnds) {
              return false;
          }
          
          // Handle OR conditions: if OR conditions exist, company must have at least one of them
          // This check is only performed if there are OR filters.
          if (orTechs.length > 0) {
            const hasAnyOr = orTechs.some((tech) => company.technologies.includes(tech));
            if (!hasAnyOr) {
              return false;
            }
          }
        }
        return true;
      });

    setResults(furtherFiltered);
  }, [allCompanies, miniSearch]);

  const reset = useCallback(() => {
    setResults(allCompanies);
  }, [allCompanies]);

  return { results, search, reset };
}
