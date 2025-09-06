
<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
=======
'use client';

import type { z } from 'zod';
import React, { useState, useEffect, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar, SidebarContent } from '@/components/ui/sidebar';
import { SearchSidebar, type FiltersSchema } from '@/components/search-sidebar';
import { ResultsTable } from '@/components/results-table';
import { type Company } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PanelLeft, CircleDashed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
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
        setResults(companiesData);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
    setIsMounted(true);
  }, []);

  const handleSearch = useCallback(async (filters: z.infer<typeof FiltersSchema>) => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResults(allCompanies);
    setMainSearchTerm('');
  }, [allCompanies]);
  
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
>>>>>>> 61da14a3713d275c996118bc2176fd7dc691e9e9

export default function LandingPage() {
  return (
<<<<<<< HEAD
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Search className="h-6 w-6 text-primary" />
          <span className="sr-only">Fiber AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/search" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Search
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Uncover Your Next Opportunity with Fiber AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The ultimate platform for discovering and analyzing companies. Leverage AI-powered search to find the perfect fit.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/search"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <img
                src="https://picsum.photos/1200/800"
                width="1200"
                height="800"
                alt="Hero"
                data-ai-hint="abstract office"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Unlock Powerful Insights</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides comprehensive tools to help you identify, analyze, and connect with companies that match your criteria.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Advanced Search</h3>
                <p className="text-muted-foreground">
                  Filter by industry, location, technology, revenue, and more to pinpoint the exact companies you're looking for.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Natural Language Queries</h3>
                <p className="text-muted-foreground">
                  Use plain English to search. Our AI understands your intent and translates it into precise filters.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Data Export</h3>
                <p className="text-muted-foreground">
                  Easily export your search results to CSV or JSON for further analysis and integration into your workflows.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Find Your Next Partner?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of professionals who use Fiber AI to discover new opportunities and drive growth.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/search" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Start Your Search <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Fiber AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
=======
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent>
          <SearchSidebar allCompanies={allCompanies} onSearch={handleSearch} onReset={handleReset} isSearching={isSearching} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="relative flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 md:px-6">
            <AppSidebarTrigger />
            <h1 className="text-lg font-semibold md:text-xl">Fiber AI</h1>
          </header>
          <main className="flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <div className="mb-4">
               <Input 
                  placeholder="Search by company name or domain from the current results..."
                  value={mainSearchTerm}
                  onChange={(e) => setMainSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
            </div>
            {isSearching ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <CircleDashed className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Searching...</p>
                </div>
              </div>
            ) : (
              <ResultsTable data={displayedResults} />
            )}
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
>>>>>>> 61da14a3713d275c996118bc2176fd7dc691e9e9
  );
}
