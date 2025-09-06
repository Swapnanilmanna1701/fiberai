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

    let filteredCompanies: Company[];

    if (filters.search) {
      const searchResult = miniSearch.search(filters.search);
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
  }
}
