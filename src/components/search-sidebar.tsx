
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestFilters } from '@/ai/flows/intelligent-filter-suggestions';
import { naturalLanguageToFilters } from '@/ai/flows/natural-language-to-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Sparkles, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './icons';
import { Badge } from '@/components/ui/badge';
import type { Company } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


export const FiltersSchema = z.object({
  search: z.string().optional(),
  industries: z.array(z.string()),
  countries: z.array(z.string()),
  officeLocations: z.array(z.string()),
  technologiesAnd: z.array(z.string()),
  technologiesOr: z.array(z.string()),
  technologiesNot: z.array(z.string()),
  techCount: z.tuple([z.number(), z.number()]),
  officeLocationCount: z.tuple([z.number(), z.number()]),
  minRevenue: z.number().optional(),
  maxRevenue: z.number().optional(),
  categories: z.array(z.string()),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
});

type SearchSidebarProps = {
  allCompanies: Company[];
  onSearch: (filters: z.infer<typeof FiltersSchema>) => void;
  onReset: () => void;
};

export function SearchSidebar({ allCompanies, onSearch, onReset }: SearchSidebarProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const { allTechnologies, allIndustries, allCountries, allOfficeLocations, allCategories, allFoundedYears } = useMemo(() => {
    const technologies = [...new Set(allCompanies.flatMap(c => c.technologies))].sort();
    const industries = [...new Set(allCompanies.map(c => c.industry))].sort();
    const countries = [...new Set(allCompanies.map(c => c.hq_country))].sort();
    const officeLocations = [...new Set(allCompanies.flatMap(c => c.office_locations))].sort();
    const categories = [...new Set(allCompanies.map(c => c.category))].sort();
    const foundedYears = [...new Set(allCompanies.map(c => c.founded))].sort((a,b) => a - b);
    
    return { 
      allTechnologies: technologies.map(t => ({ label: t, value: t })),
      allIndustries: industries.map(i => ({ label: i, value: i })),
      allCountries: countries.map(c => ({ label: c, value: c })),
      allOfficeLocations: officeLocations.map(l => ({ label: l, value: l })),
      allCategories: categories.map(c => ({ label: c, value: c })),
      allFoundedYears: foundedYears.map(y => ({ label: String(y), value: String(y) })),
    };
  }, [allCompanies]);

  const form = useForm<z.infer<typeof FiltersSchema>>({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      search: '',
      industries: [],
      countries: [],
      officeLocations: [],
      technologiesAnd: [],
      technologiesOr: [],
      technologiesNot: [],
      techCount: [0, 50],
      officeLocationCount: [0, 50],
      minRevenue: undefined,
      maxRevenue: undefined,
      categories: [],
      startYear: undefined,
      endYear: undefined,
    },
  });

  const onSubmit = (data: z.infer<typeof FiltersSchema>) => {
    onSearch(data);
  };
  
  const handleReset = () => {
    form.reset();
    onReset();
  };

  const handleAiSuggestions = async () => {
    const search = form.getValues('search');
    if (!search) {
      toast({
        title: 'AI Suggestions',
        description: 'Please type a company name, technology, or industry first.',
        variant: 'destructive',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const suggestions = await suggestFilters({
        initialInput: search,
        availableTechnologies: allTechnologies.map(t => t.value),
        availableCountries: allCountries.map(c => c.value),
        availableIndustries: allIndustries.map(i => i.value),
        availableOfficeLocations: allOfficeLocations.map(l => l.value),
      });
      
      form.setValue('industries', suggestions.suggestedIndustries || []);
      form.setValue('countries', suggestions.suggestedCountries || []);
      form.setValue('officeLocations', suggestions.suggestedOfficeLocations || []);
      form.setValue('technologiesAnd', suggestions.suggestedTechnologies || []);
      
      toast({
        title: 'AI Suggestions Applied',
        description: 'We\'ve added some filters based on your search.',
      });

    } catch (error) {
      console.error('AI suggestion error:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch AI suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleNaturalLanguageSearch = async () => {
    const search = form.getValues('search');
    if (!search) {
      toast({
        title: 'Natural Language Search',
        description: 'Please type a search query first.',
        variant: 'destructive',
        
      });
      return;
    }

    setIsParsing(true);
    try {
      const filters = await naturalLanguageToFilters({
        query: search,
        availableTechnologies: allTechnologies.map(t => t.value),
        availableCountries: allCountries.map(c => c.value),
        availableIndustries: allIndustries.map(i => i.value),
        availableOfficeLocations: allOfficeLocations.map(l => l.value),
      });

      // Reset previous filters but apply new ones
      const searchInput = form.getValues('search');
      form.reset({ search: searchInput });
      
      form.setValue('search', filters.search || searchInput);
      form.setValue('industries', filters.industries || []);
      form.setValue('countries', filters.countries || []);
      form.setValue('officeLocations', filters.officeLocations || []);
      form.setValue('technologiesAnd', filters.technologies.filter(t => t.condition === 'AND').map(t => t.value));
      form.setValue('technologiesOr', filters.technologies.filter(t => t.condition === 'OR').map(t => t.value));
      form.setValue('technologiesNot', filters.technologies.filter(t => t.condition === 'NOT').map(t => t.value));

      form.setValue('techCount', filters.techCount || [0, 50]);
      if (filters.techCount) {
        form.setValue('startYear', filters.techCount[0]);
        form.setValue('endYear', filters.techCount[1]);
      }


      toast({
        title: 'AI Search Complete',
        description: 'Filters have been set based on your query. Click "Search" to see results.',
      });

    } catch (error) {
      console.error('Natural language search error:', error);
      toast({
        title: 'Error',
        description: 'Could not process your natural language query.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };
  
  return (
    <div className="flex h-full flex-col">
       <div className="flex h-16 items-center gap-2 border-b px-4">
          <Logo className="h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
        <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">General & Natural Language Search</Label>
              <div className="flex gap-2">
                <Input id="search" placeholder="Company, or 'tech companies in USA...'" {...form.register('search')} />
                 <Button variant="ghost" size="icon" type="button" onClick={handleNaturalLanguageSearch} disabled={isParsing} aria-label="Use Natural Language Search">
                    <Wand2 className={cn("h-4 w-4", isParsing && "animate-spin")} />
                </Button>
                <Button variant="ghost" size="icon" type="button" onClick={handleAiSuggestions} disabled={isSuggesting} aria-label="Get AI Suggestions">
                    <Sparkles className={cn("h-4 w-4", isSuggesting && "animate-spin")} />
                </Button>
              </div>
               <p className="text-xs text-muted-foreground">
                  Use <Wand2 className="inline-block h-3 w-3" /> for natural language or <Sparkles className="inline-block h-3 w-3" /> for suggestions.
                </p>
            </div>

             <Accordion type="multiple" defaultValue={['technologies', 'details']} className="w-full">
              <AccordionItem value="technologies">
                <AccordionTrigger className="text-base font-semibold">Technologies</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Include ALL (AND)</Label>
                        <Controller
                            control={form.control}
                            name="technologiesAnd"
                            render={({ field }) => (
                               <MultiSelectCombobox
                                options={allTechnologies}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="e.g. Stripe, Shopify"
                               />
                            )}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Include ANY (OR)</Label>
                        <Controller
                            control={form.control}
                            name="technologiesOr"
                            render={({ field }) => (
                               <MultiSelectCombobox
                                options={allTechnologies}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="e.g. Next.js, React"
                               />
                            )}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Exclude (NOT)</Label>
                        <Controller
                            control={form.control}
                            name="technologiesNot"
                            render={({ field }) => (
                               <MultiSelectCombobox
                                options={allTechnologies}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="e.g. Intercom"
                               />
                            )}
                        />
                    </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="details">
                <AccordionTrigger className="text-base font-semibold">Company Details</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Controller
                        control={form.control}
                        name="industries"
                        render={({ field }) => (
                           <MultiSelectCombobox
                            options={allIndustries}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select industries..."
                           />
                        )}
                        />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Controller
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                           <MultiSelectCombobox
                            options={allCategories}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select categories..."
                           />
                        )}
                        />
                  </div>
                  <div className="space-y-2">
                    <Label>Headquarters Country</Label>
                     <Controller
                        control={form.control}
                        name="countries"
                        render={({ field }) => (
                           <MultiSelectCombobox
                            options={allCountries}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select countries..."
                           />
                        )}
                        />
                  </div>
                   <div className="space-y-2">
                    <Label>Office Location</Label>
                     <Controller
                        control={form.control}
                        name="officeLocations"
                        render={({ field }) => (
                           <MultiSelectCombobox
                            options={allOfficeLocations}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select office locations..."
                           />
                        )}
                        />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Founded Year</Label>
                    <div className="flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name="startYear"
                        render={({ field }) => (
                          <Select onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)} value={String(field.value ?? '')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Start Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {allFoundedYears.map(year => (
                                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <span>-</span>
                      <Controller
                        control={form.control}
                        name="endYear"
                        render={({ field }) => (
                           <Select onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)} value={String(field.value ?? '')}>
                            <SelectTrigger>
                              <SelectValue placeholder="End Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {allFoundedYears.map(year => (
                                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                   <div className="space-y-2 pt-2">
                    <Label>Number of Office Locations</Label>
                    <div className="flex items-center gap-2">
                      <Controller
                          control={form.control}
                          name="officeLocationCount.0"
                          render={({ field }) => (
                              <Input
                                  type="number"
                                  placeholder="Min"
                                  className="w-full"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                          )}
                      />
                      <span>-</span>
                      <Controller
                          control={form.control}
                          name="officeLocationCount.1"
                           render={({ field }) => (
                              <Input
                                  type="number"
                                  placeholder="Max"
                                  className="w-full"
                                  {...field}
                                  value={field.value === 50 ? '' : (field.value ?? '')}
                                  onChange={e => field.onChange(e.target.value === '' ? 50 : Number(e.target.value))}
                              />
                          )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Tech Stack Size</Label>
                    <div className="flex items-center gap-2">
                      <Controller
                          control={form.control}
                          name="techCount.0"
                          render={({ field }) => (
                              <Input
                                  type="number"
                                  placeholder="Min"
                                  className="w-full"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                          )}
                      />
                      <span>-</span>
                      <Controller
                          control={form.control}
                          name="techCount.1"
                           render={({ field }) => (
                              <Input
                                  type="number"
                                  placeholder="Max"
                                  className="w-full"
                                  {...field}
                                  value={field.value === 50 ? '' : (field.value ?? '')}
                                  onChange={e => field.onChange(e.target.value === '' ? 50 : Number(e.target.value))}
                              />
                          )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Revenue (USD Millions)</Label>
                    <div className="flex items-center gap-2">
                      <Controller
                          control={form.control}
                          name="minRevenue"
                          render={({ field }) => (
                              <Input
                                  type="number"
                                  placeholder="Min"
                                  className="w-full"
                                  {...field}
                                  value={field.value === undefined ? '' : field.value}
                                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              />
                          )}
                      />
                      <span>-</span>
                      <Controller
                          control={form.control}
                          name="maxRevenue"
                          render={({ field }) => (
                              <Input
                                  type="number"
                                  placeholder="Max"
                                  className="w-full"
                                  {...field}
                                   value={field.value === undefined ? '' : field.value}
                                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              />
                          )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
             </Accordion>

          </div>
        </ScrollArea>
        <div className="mt-auto border-t p-4">
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Search</Button>
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
          </div>
        </div>
      </form>
    </div>
  );
}


function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder,
  className,
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    const newSelected = selected.includes(selectedValue)
      ? selected.filter((s) => s !== selectedValue)
      : [...selected, selectedValue];
    onChange(newSelected);
  };
  
  const handleRemove = (valueToRemove: string) => {
    onChange(selected.filter(s => s !== valueToRemove));
  };
  
  const getDisplayValue = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length <= 2) return selected.join(', ');
    return `${selected.length} selected`;
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-between font-normal", className)}
          >
            <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  {options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleSelect(option.value)}
                      >
                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map(value => (
            <Badge key={value} variant="secondary" className="flex items-center gap-1">
              {value}
              <button
                onClick={() => handleRemove(value)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

    
