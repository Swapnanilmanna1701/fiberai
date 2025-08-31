
'use client';

import React, { useState, useEffect } from 'react';
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
import { Slider } from '@/components/ui/slider';
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
      minRevenue: undefined,
      maxRevenue: undefined,
    },
  });

  const { replace } = useFieldArray({
    control: form.control,
    name: 'technologies',
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
        .filter(tech => !currentTechs.some(t => t.value === tech))
        .map(tech => ({ value: tech, condition: 'AND' as const }));

      if (newTechs.length > 0) {
        form.setValue('technologies', [...currentTechs, ...newTechs]);
      }
      
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
      replace(filters.technologies || []);
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
                  <Controller
                    control={form.control}
                    name="technologies"
                    render={({ field }) => (
                      <TechnologyMultiSelect
                        options={techOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select technologies..."
                      />
                    )}
                  />
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
                           <MultiSelectPopover
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
                           <MultiSelectPopover
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
                           <MultiSelectPopover
                            options={officeLocationOptions}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select office locations..."
                           />
                        )}
                        />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Controller
                      control={form.control}
                      name="techCount"
                      render={({ field }) => (
                        <>
                          <div className="flex justify-between text-sm">
                            <Label>Tech Stack Size</Label>
                            <span>{field.value[0]} - {field.value[1] === 50 ? '50+' : field.value[1]}</span>
                          </div>
                          <Slider
                            min={0}
                            max={50}
                            step={1}
                            value={[field.value[0], field.value[1]]}
                            onValueChange={(value) => field.onChange([value[0], value[1]])}
                          />
                        </>
                      )}
                    />
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

// MultiSelect for multiple values (industry, country)
function MultiSelectPopover({
  options,
  selected,
  onChange,
  placeholder,
  className,
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: any) => void;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  useClickAway(popoverRef, () => {
    if (open) {
      setOpen(false);
    }
  });
  
  const handleSelect = (selectedValue: string) => {
    const newSelected = selected.includes(selectedValue)
      ? selected.filter((s) => s !== selectedValue)
      : [...selected, selectedValue];
    onChange(newSelected);
  };
  
  const getDisplayValue = () => {
    if (selected.length === 0) return placeholder;
    
    const selectedItems = selected
      .map(value => options.find(o => o.value === value))
      .filter(Boolean) as { label: string; value: string }[];

    return (
      <div className="flex flex-wrap items-center gap-1">
        {selectedItems.map(item => (
          <Badge
            key={item.value}
            variant="secondary"
            className="cursor-pointer hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSelect(item.value);
            }}
          >
            {item.label}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between font-normal min-h-10 h-auto", className)}
        >
          <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={popoverRef} className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-64">
              {selected.length > 0 && (
                <div
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-500 hover:!text-red-500"
                    onClick={() => onChange([])}
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear selection
                </div>
              )}
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </div>
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

// MultiSelect for technologies with conditions
function TechnologyMultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  className,
}: {
  options: { label: string; value: string }[];
  selected: z.infer<typeof technologySchema>[];
  onChange: (selected: z.infer<typeof technologySchema>[]) => void;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  useClickAway(popoverRef, () => {
    if (open) {
      setOpen(false);
    }
  });
  
  const handleSelect = (selectedValue: string) => {
    const existing = selected.find(s => s.value === selectedValue);
    if (existing) {
      onChange(selected.filter(s => s.value !== selectedValue));
    } else {
      onChange([...selected, { value: selectedValue, condition: 'AND' }]);
    }
  };

  const handleConditionChange = (value: string, condition: 'AND' | 'OR' | 'NOT') => {
    onChange(selected.map(s => s.value === value ? { ...s, condition } : s));
  };

  const getDisplayValue = () => {
    if (selected.length === 0) return placeholder;
    return (
      <div className="flex flex-wrap items-center gap-1">
        {selected.map(s => (
           <Badge
            key={s.value}
            variant="secondary"
            className="cursor-pointer hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSelect(s.value);
            }}
          >
            {s.value}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between font-normal min-h-10 h-auto", className)}
        >
          <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={popoverRef} className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search technologies..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {selected.length > 0 && (
                   <div
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-500 hover:!text-red-500"
                    onClick={() => onChange([])}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Clear selection
                    </div>
                )}
                {options.map((option) => {
                  const selection = selected.find(s => s.value === option.value);
                  const isSelected = !!selection;
                  return (
                    <div
                      key={option.value}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                       onClick={(e) => { e.preventDefault(); handleSelect(option.value); }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1">{option.label}</span>
                      {isSelected && (
                        <div className="flex gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant={selection.condition === 'AND' ? 'secondary' : 'ghost'} className="h-6 px-1.5 text-xs" onClick={() => handleConditionChange(option.value, 'AND')}>AND</Button>
                          <Button size="sm" variant={selection.condition === 'OR' ? 'secondary' : 'ghost'} className="h-6 px-1.5 text-xs" onClick={() => handleConditionChange(option.value, 'OR')}>OR</Button>
                          <Button size="sm" variant={selection.condition === 'NOT' ? 'secondary' : 'ghost'} className="h-6 px-1.5 text-xs" onClick={() => handleConditionChange(option.value, 'NOT')}>NOT</Button>
                        </div>
                      )}
                    </div>
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
