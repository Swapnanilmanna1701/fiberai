
'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Company } from '@/lib/data';
import type { z } from 'zod';
import type { FiltersSchema } from '@/components/search-sidebar';
import MiniSearch from 'minisearch';

export function useCompanySearch(allCompanies: Company[]) {
  const [results, setResults] = useState<Company[]>(allCompanies);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch<Company>({
      fields: ['name', 'domain', 'industry', 'technologies', 'hq_country', 'office_locations', 'category'],
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

        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(company.category)) {
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

        // Founded year filter
        if (filters.foundedYear !== undefined && filters.foundedYear > 0 && company.founded !== filters.foundedYear) {
          return false;
        }
        
        // Office location count filter
        if (company.office_locations.length < filters.officeLocationCount[0] || company.office_locations.length > filters.officeLocationCount[1]) {
          return false;
        }

        // Technology boolean logic
        const { technologiesAnd, technologiesOr, technologiesNot } = filters;

        // NOT condition
        if (technologiesNot.length > 0 && technologiesNot.some(tech => company.technologies.includes(tech))) {
          return false;
        }

        // AND condition
        if (technologiesAnd.length > 0 && !technologiesAnd.every(tech => company.technologies.includes(tech))) {
          return false;
        }
        
        // OR condition
        if (technologiesOr.length > 0 && !technologiesOr.some(tech => company.technologies.includes(tech))) {
          return false;
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
