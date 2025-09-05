
'use client';

import type { z } from 'zod';
import React, { useState, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar, SidebarContent } from '@/components/ui/sidebar';
import { SearchSidebar } from '@/components/search-sidebar';
import { ResultsTable } from '@/components/results-table';
import { type Company } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PanelLeft, CircleDashed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCompanySearch } from '@/hooks/use-company-search';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { results, search, reset } = useCompanySearch(allCompanies);
  const [mainSearchTerm, setMainSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "companies"));
        const companiesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: parseInt(doc.id, 10),
          } as Company;
        });
        setAllCompanies(companiesData);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
    setIsMounted(true);
  }, []);
  
  const displayedResults = mainSearchTerm
    ? results.filter(company =>
        company.name.toLowerCase().includes(mainSearchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(mainSearchTerm.toLowerCase())
      )
    : results;

  if (!isMounted || isLoading) {
    return (
       <div className="flex h-screen w-screen items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <CircleDashed className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading companies...</p>
         </div>
       </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent>
          <SearchSidebar allCompanies={allCompanies} onSearch={search} onReset={reset} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="relative flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 md:px-6">
            <AppSidebarTrigger />
            <h1 className="text-lg font-semibold md:text-xl">Fiber AI</h1>
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
