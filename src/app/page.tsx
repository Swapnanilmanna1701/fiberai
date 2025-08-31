
'use client';

import type { z } from 'zod';
import React, { useState, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar, SidebarContent } from '@/components/ui/sidebar';
import { SearchSidebar, type FiltersSchema } from '@/components/search-sidebar';
import { ResultsTable } from '@/components/results-table';
import { companies, type Company } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [results, setResults] = useState<Company[]>(companies);
  const [isMounted, setIsMounted] = useState(false);
  const [mainSearchTerm, setMainSearchTerm] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setResults(companies);
  }, []);

  const handleSearch = (filters: z.infer<typeof FiltersSchema>) => {
    const filtered = companies.filter((company) => {
      // Text search
      if (
        filters.search &&
        !company.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !company.domain.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

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
      
      // Technology boolean logic
      const techFilters = filters.technologies;
      if (techFilters.length > 0) {
        const included = techFilters.filter(t => t.condition === 'AND').map(t => t.value);
        const excluded = techFilters.filter(t => t.condition === 'NOT').map(t => t.value);
        const or = techFilters.filter(t => t.condition === 'OR').map(t => t.value);

        if (excluded.some(tech => company.technologies.includes(tech))) {
          return false;
        }

        if (!included.every(tech => company.technologies.includes(tech))) {
          return false;
        }
        
        if (or.length > 0 && !or.some(tech => company.technologies.includes(tech))) {
          if (included.length === 0) return false;
        }
      }

      return true;
    });

    setResults(filtered);
  };
  
  const handleReset = () => {
    setResults(companies);
  };
  
  const displayedResults = mainSearchTerm
    ? results.filter(company =>
        company.name.toLowerCase().includes(mainSearchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(mainSearchTerm.toLowerCase())
      )
    : results;


  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent>
          <SearchSidebar onSearch={handleSearch} onReset={handleReset} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full min-h-svh flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 md:px-6">
            <AppSidebarTrigger />
            <h1 className="text-lg font-semibold md:text-xl">TechStack Explorer</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="mb-4">
               <Input 
                  placeholder="Search by company name or domain from the current results..."
                  value={mainSearchTerm}
                  onChange={(e) => setMainSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
            </div>
            <ResultsTable data={displayedResults} />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppSidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
