
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
import { PlusCircle, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dzStates } from "@/lib/dz-states"
import { useEffect, useMemo, useRef } from "react"

const citySchema = z.object({
    name: z.string().min(1, "City name is required."),
    price: z.coerce.number().positive("Price must be a positive number.")
})

const shippingZoneSchema = z.object({
  state: z.string().min(1, "Please select a state."),
  defaultPrice: z.coerce.number().min(0, "Default price must be non-negative.").optional(),
  cities: z.array(citySchema).optional(),
}).refine(data => data.defaultPrice || (data.cities && data.cities.length > 0), {
    message: "You must provide a default price for the state or define at least one city-specific price.",
    path: ["defaultPrice"],
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

  const form = useForm<ShippingZoneFormValues>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      state: shippingZone?.state || "",
      defaultPrice: shippingZone?.defaultPrice || undefined,
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
    return selectedStateData ? selectedStateData.cities : [];
  }, [watchedState]);

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
        
        <FormField
            control={form.control}
            name="defaultPrice"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Default State Price</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>This price applies to all cities in the state unless overridden below.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />

        <div>
            <FormLabel>City-Specific Prices (Overrides)</FormLabel>
            <div className="space-y-3 mt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_100px_auto] gap-2 items-start">
                        <FormField
                            control={form.control}
                            name={`cities.${index}.name`}
                            render={({ field: cityField }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">City Name</FormLabel>
                                    <Select onValueChange={cityField.onChange} value={cityField.value} disabled={!watchedState}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableCities.map((city) => (
                                                <SelectItem key={city} value={city}>
                                                    {city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`cities.${index}.price`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Price" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => append({ name: "", price: 0 })}
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
