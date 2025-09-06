<<<<<<< HEAD
import {NextRequest, NextResponse} from 'next/server';
import {companies} from '@/lib/data';
import type {Company} from '@/lib/data';
import type {z} from 'zod';
import type {FiltersSchema} from '@/components/search-sidebar';
import MiniSearch from 'minisearch';

const miniSearch = new MiniSearch<Company>({
  fields: ['name', 'domain', 'industry', 'technologies', 'hq_country', 'office_locations', 'category'],
  storeFields: ['id'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
  },
});
miniSearch.addAll(companies);

export async function POST(req: NextRequest) {
  try {
    const filters: z.infer<typeof FiltersSchema> = await req.json();
=======

import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company } from '@/lib/data';
import { FiltersSchema } from '@/components/search-sidebar';
import MiniSearch from 'minisearch';

export async function POST(request: Request) {
  try {
    const filters = FiltersSchema.parse(await request.json());

    const querySnapshot = await getDocs(collection(db, "companies"));
    const allCompanies = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: parseInt(doc.id, 10),
      } as Company;
    });

    const miniSearch = new MiniSearch<Company>({
        fields: ['name', 'domain', 'industry', 'technologies', 'hq_country', 'office_locations', 'category'],
        storeFields: ['id'],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
        },
      });
    miniSearch.addAll(allCompanies);
>>>>>>> 61da14a3713d275c996118bc2176fd7dc691e9e9

    let filteredCompanies: Company[];

    if (filters.search) {
      const searchResult = miniSearch.search(filters.search);
<<<<<<< HEAD
      const resultMap = new Map(companies.map(c => [c.id, c]));
      filteredCompanies = searchResult.map(res => resultMap.get(res.id)!).filter(Boolean);
    } else {
      filteredCompanies = [...companies];
    }

    const furtherFiltered = filteredCompanies.filter(company => {
      if (filters.industries?.length && !filters.industries.includes(company.industry)) {
        return false;
      }
      if (filters.categories?.length && !filters.categories.includes(company.category)) {
        return false;
      }
      if (filters.countries?.length && !filters.countries.includes(company.hq_country)) {
        return false;
      }
      if (filters.officeLocations?.length && !filters.officeLocations.some(loc => company.office_locations.includes(loc))) {
        return false;
      }

      const minRevenueValue = filters.minRevenue?.value;
      const minRevenueUnit = filters.minRevenue?.unit || 'millions';
      if (minRevenueValue !== undefined) {
        const minRevenue = minRevenueValue * (minRevenueUnit === 'billions' ? 1_000_000_000 : 1_000_000);
        if (company.revenue < minRevenue) return false;
      }

      const maxRevenueValue = filters.maxRevenue?.value;
      const maxRevenueUnit = filters.maxRevenue?.unit || 'millions';
      if (maxRevenueValue !== undefined) {
        const maxRevenue = maxRevenueValue * (maxRevenueUnit === 'billions' ? 1_000_000_000 : 1_000_000);
        if (company.revenue > maxRevenue) return false;
      }

      if (filters.techCount && (company.technologies.length < filters.techCount[0] || company.technologies.length > filters.techCount[1])) {
        return false;
      }
      
      if (filters.foundedYear !== undefined && filters.foundedYear > 0 && company.founded !== filters.foundedYear) {
          return false;
      }

      if (filters.officeLocationCount && (company.office_locations.length < filters.officeLocationCount[0] || company.office_locations.length > filters.officeLocationCount[1])) {
          return false;
      }
      
      if (filters.employeeCount && (company.employees < filters.employeeCount[0] || company.employees > filters.employeeCount[1])) {
          return false;
      }

      const { technologiesAnd, technologiesOr, technologiesNot } = filters;
      
      if (technologiesNot?.length && technologiesNot.some(tech => company.technologies.includes(tech))) {
          return false;
      }

      if (technologiesAnd?.length && !technologiesAnd.every(tech => company.technologies.includes(tech))) {
          return false;
      }
      
      if (technologiesOr?.length && !technologiesOr.some(tech => company.technologies.includes(tech))) {
        return false;
      }
        
      return true;
    });

    return NextResponse.json({ results: furtherFiltered });
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
=======
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

        // Revenue filter
<<<<<<<< HEAD:src/hooks/use-company-search.ts
        const minRevenueValue = filters.minRevenue?.value;
        const minRevenueUnit = filters.minRevenue?.unit || 'millions';
        if (minRevenueValue !== undefined) {
            const minRevenue = minRevenueValue * (minRevenueUnit === 'billions' ? 1_000_000_000 : 1_000_000);
            if (company.revenue < minRevenue) return false;
        }
========
<<<<<<< HEAD:src/app/api/search/route.ts
        const minRevenueValue = filters.minRevenue !== undefined ? filters.minRevenue * (filters.minRevenueUnit === 'billion' ? 1000000000 : 1000000) : undefined;
        const maxRevenueValue = filters.maxRevenue !== undefined ? filters.maxRevenue * (filters.maxRevenueUnit === 'billion' ? 1000000000 : 1000000) : undefined;

        if (minRevenueValue !== undefined && company.revenue < minRevenueValue) {
            return false;
        }
        if (maxRevenueValue !== undefined && company.revenue > maxRevenueValue) {
            return false;
=======
        const minRevenueValue = filters.minRevenue?.value;
        const minRevenueUnit = filters.minRevenue?.unit || 'millions';
        if (minRevenueValue !== undefined) {
            const minRevenue = minRevenueValue * (minRevenueUnit === 'billions' ? 1_000_000_000 : 1_000_000);
            if (company.revenue < minRevenue) return false;
        }
>>>>>>>> 61da14a3713d275c996118bc2176fd7dc691e9e9:src/app/api/search/route.ts

        const maxRevenueValue = filters.maxRevenue?.value;
        const maxRevenueUnit = filters.maxRevenue?.unit || 'millions';
        if (maxRevenueValue !== undefined) {
            const maxRevenue = maxRevenueValue * (maxRevenueUnit === 'billions' ? 1_000_000_000 : 1_000_000);
            if (company.revenue > maxRevenue) return false;
<<<<<<<< HEAD:src/hooks/use-company-search.ts
========
>>>>>>> 8386775 (make sure that user can chose revenue in million and billion for both ma):src/hooks/use-company-search.ts
>>>>>>>> 61da14a3713d275c996118bc2176fd7dc691e9e9:src/app/api/search/route.ts
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

        // Employee count filter
        if (company.employees < filters.employeeCount[0] || company.employees > filters.employeeCount[1]) {
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

    return NextResponse.json(furtherFiltered);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ message: 'An error occurred during search.' }, { status: 500 });
>>>>>>> 61da14a3713d275c996118bc2176fd7dc691e9e9
  }
}
