'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Download, ExternalLink } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import type { Company } from '@/lib/data';

type SortKey = keyof Company | '';
type SortDirection = 'asc' | 'desc';

export function ResultsTable({ data }: { data: Company[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortKey, sortDirection]);

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
      hq_country: c.hq_country,
      revenue_usd: c.revenue,
      employees: c.employees,
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

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => handleSort(key)}>
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Results</h2>
        <Button onClick={handleExport} disabled={data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="name">Company</SortableHeader>
              <SortableHeader sortKey="industry">Industry</SortableHeader>
              <SortableHeader sortKey="hq_country">HQ</SortableHeader>
              <SortableHeader sortKey="revenue">Revenue</SortableHeader>
              <SortableHeader sortKey="employees">Employees</SortableHeader>
              <TableHead>Technologies</TableHead>
              <TableHead>Office Locations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((company) => (
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
                  <TableCell>{company.hq_country}</TableCell>
                  <TableCell>{formatRevenue(company.revenue)}</TableCell>
                  <TableCell>{company.employees.toLocaleString()}</TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
