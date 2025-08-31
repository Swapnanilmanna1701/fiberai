
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
import { useCompanySearch } from '@/hooks/use-company-search';


export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { results, search, reset } = useCompanySearch(companies);
  const [mainSearchTerm, setMainSearchTerm] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
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
          <SearchSidebar onSearch={search} onReset={reset} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="relative flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 md:px-6">
            <AppSidebarTrigger />
            <h1 className="text-lg font-semibold md:text-xl">TechStack Explorer</h1>
          </header>
          <main className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
            <div className="mb-4 flex-shrink-0">
               <Input 
                  placeholder="Search by company name or domain from the current results..."
                  value={mainSearchTerm}
                  onChange={(e) => setMainSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
            </div>
            <div className="flex-grow overflow-auto">
              <ResultsTable data={displayedResults} />
            </div>
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
