"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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

const citySchema = z.object({
    name: z.string().min(1, "City name is required."),
    price: z.coerce.number().positive("Price must be a positive number.")
})

const shippingZoneSchema = z.object({
  state: z.string().min(2, "State name must be at least 2 characters."),
  cities: z.array(citySchema).min(1, "At least one city is required.")
})

type ShippingZoneFormValues = z.infer<typeof shippingZoneSchema>

interface ShippingZoneFormProps {
  onFormSubmit: () => void;
  shippingZone?: ShippingState;
}

export function ShippingZoneForm({ onFormSubmit, shippingZone }: ShippingZoneFormProps) {
  const { toast } = useToast()
  const isEditMode = !!shippingZone;

  const form = useForm<ShippingZoneFormValues>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      state: shippingZone?.state || "",
      cities: shippingZone?.cities || [{ name: "", price: 0 }],
    },
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cities"
  });

  async function onSubmit(data: ShippingZoneFormValues) {
    const result = isEditMode
        ? await updateShippingOption(shippingZone.id, data)
        : await addShippingOption(data);

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
              <FormControl>
                <Input placeholder="e.g. Algiers" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
            <FormLabel>Cities & Prices</FormLabel>
            <div className="space-y-3 mt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_100px_auto] gap-2 items-end">
                        <FormField
                            control={form.control}
                            name={`cities.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">City Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="City Name" {...field} />
                                </FormControl>
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
                         <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
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
                    >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add City
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
