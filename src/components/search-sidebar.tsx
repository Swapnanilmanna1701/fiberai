
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { allTechnologies, allIndustries, allCountries, allOfficeLocations } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Sparkles, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './icons';
import { Badge } from '@/components/ui/badge';

const technologySchema = z.object({
  value: z.string().min(1, 'Please select a technology'),
  condition: z.enum(['AND', 'OR', 'NOT']),
});

export const FiltersSchema = z.object({
  search: z.string().optional(),
  industries: z.array(z.string()),
  countries: z.array(z.string()),
  officeLocations: z.array(z.string()),
  technologies: z.array(technologySchema),
  techCount: z.tuple([z.number(), z.number()]),
  officeLocationCount: z.tuple([z.number(), z.number()]),
  minRevenue: z.number().optional(),
  maxRevenue: z.number().optional(),
});

type SearchSidebarProps = {
  onSearch: (filters: z.infer<typeof FiltersSchema>) => void;
  onReset: () => void;
};

const techOptions = allTechnologies.map(t => ({ label: t, value: t }));
const industryOptions = allIndustries.map(i => ({ label: i, value: i }));
const countryOptions = allCountries.map(c => ({ label: c, value: c }));
const officeLocationOptions = allOfficeLocations.map(l => ({label: l, value: l}));

export function SearchSidebar({ onSearch, onReset }: SearchSidebarProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<z.infer<typeof FiltersSchema>>({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      search: '',
      industries: [],
      countries: [],
      officeLocations: [],
      technologies: [],
      techCount: [0, 50],
      officeLocationCount: [0, 50],
      minRevenue: undefined,
      maxRevenue: undefined,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "technologies",
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
        availableTechnologies: allTechnologies,
        availableCountries: allCountries,
        availableIndustries: allIndustries,
        availableOfficeLocations: allOfficeLocations,
      });
      
      form.setValue('industries', suggestions.suggestedIndustries || []);
      form.setValue('countries', suggestions.suggestedCountries || []);
      form.setValue('officeLocations', suggestions.suggestedOfficeLocations || []);
      
      const currentTechs = form.getValues('technologies');
      const newTechs = (suggestions.suggestedTechnologies || [])
        .filter(tech => !currentTechs.some(t => t.value === tech));

      newTechs.forEach(tech => append({ value: tech, condition: 'AND' }));
      
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
        availableTechnologies: allTechnologies,
        availableCountries: allCountries,
        availableIndustries: allIndustries,
        availableOfficeLocations: allOfficeLocations,
      });

      // Reset previous filters but apply new ones
      const searchInput = form.getValues('search');
      form.reset({ search: searchInput }); // Keep the search input
      
      form.setValue('search', filters.search || searchInput);
      form.setValue('industries', filters.industries || []);
      form.setValue('countries', filters.countries || []);
      form.setValue('officeLocations', filters.officeLocations || []);
      
      // Clear existing technologies and append new ones
      remove();
      (filters.technologies || []).forEach(tech => append(tech));

      form.setValue('techCount', filters.techCount || [0, 50]);

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
                <AccordionContent>
                  <div className="space-y-2">
                    <Controller
                        control={form.control}
                        name="technologies"
                        render={() => (
                          <TechnologyCombobox
                            options={techOptions}
                            selected={fields}
                            onSelect={(value) => {
                               if (!fields.some(f => f.value === value)) {
                                 append({ value, condition: 'AND' });
                               }
                            }}
                          />
                        )}
                      />
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                            <span className="font-medium text-sm flex-1">{field.value}</span>
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant={field.condition === 'AND' ? 'secondary' : 'ghost'} className="h-6 px-1.5 text-xs" onClick={() => update(index, { ...field, condition: 'AND' })}>AND</Button>
                                <Button size="sm" variant={field.condition === 'OR' ? 'secondary' : 'ghost'} className="h-6 px-1.5 text-xs" onClick={() => update(index, { ...field, condition: 'OR' })}>OR</Button>
                                <Button size="sm" variant={field.condition === 'NOT' ? 'secondary' : 'ghost'} className="h-6 px-1.5 text-xs" onClick={() => update(index, { ...field, condition: 'NOT' })}>NOT</Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                               <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
                            options={industryOptions}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select industries..."
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
                            options={countryOptions}
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
                            options={officeLocationOptions}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select office locations..."
                           />
                        )}
                        />
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
  
  const getDisplayValue = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return options.find(o => o.value === selected[0])?.label;
    return `${selected.length} selected`;
  };

  return (
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
  );
}

function TechnologyCombobox({
  options,
  selected,
  onSelect,
  className,
}: {
  options: { label: string; value: string }[];
  selected: { value: string, condition: 'AND' | 'OR' | 'NOT' }[];
  onSelect: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between font-normal", className)}
        >
          Add technology...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search technologies..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {options.map((option) => {
                  const isSelected = selected.some(s => s.value === option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        onSelect(option.value);
                        setOpen(false);
                      }}
                      disabled={isSelected}
                      className={cn(isSelected && "opacity-50 cursor-not-allowed")}
                    >
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
  );
}

