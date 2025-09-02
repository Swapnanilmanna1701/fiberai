
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import type { Company } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortKey = keyof Company | 'tech_count' | '';
type SortDirection = 'asc' | 'desc';

export function ResultsTable({ data }: { data: Company[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useIsMobile();

  useEffect(() => {
    setCurrentPage(1);
  }, [data, rowsPerPage]);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      if (sortKey === 'tech_count') {
        aValue = a.technologies.length;
        bValue = b.technologies.length;
      } else {
        aValue = a[sortKey as keyof Company];
        bValue = b[sortKey as keyof Company];
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortKey, sortDirection]);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const handleExport = () => {
    const dataToExport = sortedData.map(c => ({
      name: c.name,
      domain: c.domain,
      industry: c.industry,
      category: c.category,
      founded: c.founded,
      hq_country: c.hq_country,
      revenue_usd: c.revenue,
      employees: c.employees,
      tech_count: c.technologies.length,
      technologies: c.technologies.join(', '),
      office_locations: c.office_locations.join(', '),
    }));
    exportToCsv('techstack_explorer_results.csv', dataToExport);
  };

  const formatRevenue = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  const SortableHeader = ({ sortKey: key, children, className }: { sortKey: SortKey, children: React.ReactNode, className?: string }) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => handleSort(key)}>
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );
  
    const PaginationControls = () => (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        Showing{' '}
        <strong>
          {Math.min((currentPage - 1) * rowsPerPage + 1, sortedData.length)}-
          {Math.min(currentPage * rowsPerPage, sortedData.length)}
        </strong>{' '}
        of <strong>{sortedData.length}</strong> results
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(c => c - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(c => c + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Search Results ({data.length})</h2>
          <Button onClick={handleExport} disabled={data.length === 0} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        {paginatedData.length > 0 ? (
          <div className="grid gap-4">
            {paginatedData.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                       <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {company.name}
                       </a>
                       <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-4 w-4" />
                       </a>
                    </div>
                  </CardTitle>
                  <CardDescription>
                      {company.industry} &middot; {company.category} &middot; Founded {company.founded}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">HQ</div>
                    <div className="font-medium">{company.hq_country}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="font-medium">{formatRevenue(company.revenue)}</div>
                  </div>
                   <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Employees</div>
                    <div className="font-medium">{company.employees.toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Tech Count</div>
                    <div className="font-medium">{company.technologies.length}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                   <div>
                    <h4 className="text-sm font-medium mb-2">Office Locations</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.office_locations.map((location) => (
                        <Badge key={location} variant="secondary">{location}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
             <PaginationControls />
          </div>
        ) : (
           <div className="text-center py-12 text-muted-foreground">
             No results found. Try adjusting your filters.
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-2xl font-bold">Search Results ({data.length})</h2>
        <Button onClick={handleExport} disabled={data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-lg border flex-grow overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <SortableHeader sortKey="name">Company</SortableHeader>
              <SortableHeader sortKey="industry">Industry</SortableHeader>
              <SortableHeader sortKey="category">Category</SortableHeader>
              <SortableHeader sortKey="founded">Founded</SortableHeader>
              <SortableHeader sortKey="hq_country">HQ</SortableHeader>
              <SortableHeader sortKey="revenue">Revenue</SortableHeader>
              <SortableHeader sortKey="employees">Employees</SortableHeader>
              <SortableHeader sortKey="tech_count">Tech Count</SortableHeader>
              <TableHead>Technologies</TableHead>
              <TableHead>Office Locations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{company.name}</span>
                       <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-3 w-3" />
                       </a>
                    </div>
                    <p className="text-sm text-muted-foreground">{company.domain}</p>
                  </TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>{company.category}</TableCell>
                  <TableCell>{company.founded}</TableCell>
                  <TableCell>{company.hq_country}</TableCell>
                  <TableCell>{formatRevenue(company.revenue)}</TableCell>
                  <TableCell>{company.employees.toLocaleString()}</TableCell>
                  <TableCell>{company.technologies.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {company.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                      {company.technologies.length > 3 && (
                         <Badge variant="outline">+{company.technologies.length - 3} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {company.office_locations.slice(0, 3).map((location) => (
                        <Badge key={location} variant="secondary">{location}</Badge>
                      ))}
                      {company.office_locations.length > 3 && (
                          <Badge variant="outline">+{company.office_locations.length - 3} more</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > 0 && <PaginationControls />}
    </div>
  );
}
