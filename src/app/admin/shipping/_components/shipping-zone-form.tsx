
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { addShippingOption, updateShippingOption } from "@/services/shipping-service"
import type { ShippingState } from "@/types"
import { PlusCircle, Trash2, ChevronDown, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dzStates } from "@/lib/dz-states"
import { useEffect, useMemo, useRef, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const citySchema = z.object({
    name: z.string().min(1, "City name is required."),
    homeDeliveryPrice: z.coerce.number().positive("Price must be a positive number."),
    officeDeliveryPrice: z.coerce.number().positive("Price must be a positive number."),
})

const shippingZoneSchema = z.object({
  state: z.string().min(1, "Please select a state."),
  defaultHomeDeliveryPrice: z.coerce.number().min(0, "Default price must be non-negative.").optional(),
  defaultOfficeDeliveryPrice: z.coerce.number().min(0, "Default price must be non-negative.").optional(),
  cities: z.array(citySchema).optional(),
}).refine(data => data.defaultHomeDeliveryPrice || data.defaultOfficeDeliveryPrice || (data.cities && data.cities.length > 0), {
    message: "You must provide at least one default price for the state or define at least one city-specific price.",
    path: ["defaultHomeDeliveryPrice"],
});


type ShippingZoneFormValues = z.infer<typeof shippingZoneSchema>

interface ShippingZoneFormProps {
  onFormSubmit: () => void;
  shippingZone?: ShippingState;
}

export function ShippingZoneForm({ onFormSubmit, shippingZone }: ShippingZoneFormProps) {
  const { toast } = useToast()
  const isEditMode = !!shippingZone;
  const initialRender = useRef(true);
  const [openStates, setOpenStates] = useState<boolean[]>([]);
  const [cityDropdownSearch, setCityDropdownSearch] = useState("");
  const [addedCitySearch, setAddedCitySearch] = useState("");

  const form = useForm<ShippingZoneFormValues>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      state: shippingZone?.state || "",
      defaultHomeDeliveryPrice: shippingZone?.defaultHomeDeliveryPrice || undefined,
      defaultOfficeDeliveryPrice: shippingZone?.defaultOfficeDeliveryPrice || undefined,
      cities: shippingZone?.cities || [],
    },
  })
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "cities"
  });
  
  const watchedState = form.watch("state");

  const availableCities = useMemo(() => {
    const selectedStateData = dzStates.find(s => s.name === watchedState);
    if (!selectedStateData) return [];
    if (!cityDropdownSearch) return selectedStateData.cities;
    return selectedStateData.cities.filter(city => 
        city.toLowerCase().includes(cityDropdownSearch.toLowerCase())
    );
  }, [watchedState, cityDropdownSearch]);
  
  const filteredAddedCities = useMemo(() => {
    return fields.map((field, index) => ({ field, index })).filter(({ field, index }) => {
        const cityName = form.getValues(`cities.${index}.name`);
        return cityName.toLowerCase().includes(addedCitySearch.toLowerCase());
    });
  }, [fields, addedCitySearch, form]);

  useEffect(() => {
    if (initialRender.current) {
        initialRender.current = false;
        return;
    }
    
    if (!isEditMode) {
        replace([]);
    } else if (watchedState !== shippingZone?.state) {
        replace([]);
    }
  }, [watchedState, replace, isEditMode, shippingZone?.state]);

   const handleOpenChange = (index: number, isOpen: boolean) => {
    setOpenStates(currentStates => {
      const newStates = [...currentStates];
      newStates[index] = isOpen;
      return newStates;
    });
  };


  async function onSubmit(data: ShippingZoneFormValues) {
    const finalData = {
        ...data,
        cities: data.cities || [],
    };
    
    const result = isEditMode
        ? await updateShippingOption(shippingZone.id, finalData)
        : await addShippingOption(finalData);

    if (result.success) {
      toast({
        title: isEditMode ? "Zone Updated" : "Zone Added",
        description: `"${data.state}" has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      form.reset();
      onFormSubmit();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Something went wrong.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State (Wilaya)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {dzStates.map((state) => (
                            <SelectItem key={state.id} value={state.name}>
                                {state.id} - {state.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2 rounded-md border p-4">
            <FormLabel>Default State Prices</FormLabel>
            <FormDescription>These prices apply to all cities in the state unless overridden below.</FormDescription>
             <div className="grid grid-cols-2 gap-4 pt-2">
                <FormField
                    control={form.control}
                    name="defaultHomeDeliveryPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Home Delivery</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 600" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="defaultOfficeDeliveryPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Desk Delivery</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 400" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
        </div>


        <div>
            <FormLabel>City-Specific Prices (Overrides)</FormLabel>
            <div className="relative my-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search added cities..."
                    value={addedCitySearch}
                    onChange={(e) => setAddedCitySearch(e.target.value)}
                    className="pl-8"
                    disabled={!watchedState || fields.length === 0}
                />
            </div>
            <div className="space-y-3 mt-2">
                {filteredAddedCities.map(({ field, index }) => (
                    <Collapsible key={field.id} open={openStates[index] || false} onOpenChange={(isOpen) => handleOpenChange(index, isOpen)}>
                        <div className="border rounded-md bg-background">
                            <div className="p-3 flex items-center justify-between">
                                <CollapsibleTrigger className="flex items-center gap-2 text-left w-full">
                                    <span className="font-semibold">{form.getValues(`cities.${index}.name`) || `City ${index + 1}`}</span>
                                    <ChevronDown className={cn("h-5 w-5 transition-transform", openStates[index] && "rotate-180")} />
                                </CollapsibleTrigger>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-7 w-7">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                            <CollapsibleContent>
                                <div className="p-3 border-t space-y-4">
                                     <FormField
                                        control={form.control}
                                        name={`cities.${index}.name`}
                                        render={({ field: cityField }) => (
                                            <FormItem>
                                                <FormLabel>City Name</FormLabel>
                                                <Select onValueChange={cityField.onChange} value={cityField.value} disabled={!watchedState}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a city" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                         <div className="p-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    placeholder="Search cities..."
                                                                    value={cityDropdownSearch}
                                                                    onChange={(e) => setCityDropdownSearch(e.target.value)}
                                                                    className="pl-8 mb-1"
                                                                />
                                                            </div>
                                                        </div>
                                                        {availableCities.map((city) => (
                                                            <SelectItem key={city} value={city}>
                                                                {city}
                                                            </SelectItem>
                                                        ))}
                                                        {availableCities.length === 0 && <p className="p-2 text-center text-sm text-muted-foreground">No city found.</p>}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`cities.${index}.homeDeliveryPrice`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Home Delivery Price</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`cities.${index}.officeDeliveryPrice`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Desk Delivery Price</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => append({ name: "", homeDeliveryPrice: 0, officeDeliveryPrice: 0 })}
                    disabled={!watchedState}
                    >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add City Override
                </Button>
            </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? isEditMode ? "Saving..." : "Adding..." 
            : isEditMode ? "Save Changes" : "Add Zone"}
        </Button>
      </form>
    </Form>
  )
}
