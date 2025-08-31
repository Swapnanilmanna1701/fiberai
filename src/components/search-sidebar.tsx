'use client';

import React, { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allTechnologies, allIndustries, allCountries, allOfficeLocations } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, PlusCircle, Sparkles, Trash2, Wand2, X } from 'lucide-react';
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
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
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
        append(newTechs);
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
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                       <Controller
                         key={field.id}
                         control={form.control}
                         name={`technologies.${index}`}
                         render={({ field }) => (
                           <div className="space-y-2 rounded-md border p-2">
                             <div className="flex gap-2">
                              <MultiSelectPopover
                                options={techOptions}
                                value={field.value.value}
                                onChange={(value) => field.onChange({ ...field.value, value })}
                                placeholder="Select technology..."
                              />
                               <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                             </div>
                              <RadioGroup
                                value={field.value.condition}
                                onValueChange={(condition: 'AND' | 'OR' | 'NOT') => field.onChange({ ...field.value, condition })}
                                className="flex gap-2"
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="AND" id={`and-${index}`} />
                                  <Label htmlFor={`and-${index}`} className="text-xs">AND</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="OR" id={`or-${index}`} />
                                  <Label htmlFor={`or-${index}`} className="text-xs">OR</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="NOT" id={`not-${index}`} />
                                  <Label htmlFor={`not-${index}`} className="text-xs">NOT</Label>
                                </div>
                              </RadioGroup>
                           </div>
                         )}
                       />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '', condition: 'AND' })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Technology
                    </Button>
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
  value,
}: {
  options: { label: string; value: string }[];
  selected?: string[];
  onChange: (selected: any) => void;
  placeholder: string;
  className?: string;
  value?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isMulti = Array.isArray(selected);

  const handleSelect = (selectedValue: string) => {
    if (isMulti) {
      const newSelected = selected.includes(selectedValue)
        ? selected.filter((s) => s !== selectedValue)
        : [...selected, selectedValue];
      onChange(newSelected);
    } else {
      onChange(selectedValue === value ? '' : selectedValue);
      setOpen(false);
    }
  };
  
  const getDisplayValue = () => {
    if (isMulti) {
      if (selected.length === 0) return placeholder;
      const selectedLabels = selected.map(s => options.find(o => o.value === s)?.label).filter(Boolean);
      return (
        <div className="flex flex-wrap items-center gap-1">
          {selectedLabels.map(label => <Badge key={label} variant="secondary">{label}</Badge>)}
        </div>
      )
    }
    return options.find(opt => opt.value === value)?.label || placeholder;
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-64">
              {isMulti && selected.length > 0 && (
                <CommandItem onSelect={() => onChange([])} className="text-red-500 hover:!text-red-500">
                    <X className="mr-2 h-4 w-4" />
                    Clear selection
                </CommandItem>
              )}
              {options.map((option) => {
                const isSelected = isMulti ? selected.includes(option.value) : value === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
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
