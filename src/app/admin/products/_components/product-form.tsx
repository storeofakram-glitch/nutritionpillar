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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addProduct, updateProduct } from "@/services/product-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/types"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Trash2 } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  buyingPrice: z.coerce.number().min(0, "Buying price must be a non-negative number.").optional(),
  quantity: z.coerce.number().int().min(0, "Quantity must be a non-negative integer."),
  category: z.string({ required_error: "Please select a category."}).min(1, "Please select a category."),
  imageUrls: z.array(z.object({ value: z.string().url("Must be a valid URL.") })).min(1, "At least one image URL is required."),
  sponsored: z.boolean().optional(),
  discountPercentage: z.coerce.number().min(0, "Discount must be non-negative.").max(100, "Discount cannot exceed 100.").optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  onFormSubmit: () => void;
  product?: Product;
}

const categories = [
    "Protein",
    "Performance",
    "Pre-Workout",
    "Health & Wellness",
    "Mass gainer",
    "Fat burner",
]

export function ProductForm({ onFormSubmit, product }: ProductFormProps) {
  const { toast } = useToast()
  const isEditMode = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      buyingPrice: product?.buyingPrice || 0,
      quantity: product?.quantity || 0,
      category: product?.category || "",
      imageUrls: product?.imageUrls?.map(url => ({ value: url })) || [{ value: "" }],
      sponsored: product?.sponsored || false,
      discountPercentage: product?.discountPercentage || undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "imageUrls"
  });

  async function onSubmit(data: ProductFormValues) {
    const productData = {
        ...data,
        imageUrls: data.imageUrls.map(item => item.value),
        discountPercentage: data.discountPercentage || 0,
    };

    const result = isEditMode
        ? await updateProduct(product.id, productData)
        : await addProduct(productData);

    if (result.success) {
      toast({
        title: isEditMode ? "Product Updated" : "Product Added",
        description: `"${data.name}" has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      onFormSubmit();
      form.reset();
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Whey Protein" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="High-quality protein powder..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="49.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="buyingPrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Buying Price</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="25.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div className="space-y-4">
            <FormLabel>Image URLs</FormLabel>
            {fields.map((field, index) => (
                <FormField
                    key={field.id}
                    control={form.control}
                    name={`imageUrls.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
             <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Image URL
            </Button>
            <FormDescription>
                The first image will be the primary thumbnail.
            </FormDescription>
        </div>


        <FormField
          control={form.control}
          name="sponsored"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Sponsored Product</FormLabel>
                <FormDescription>
                  Sponsored products appear at the top of the product list.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="discountPercentage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Discount Percentage</FormLabel>
                <FormDescription>
                  Set a discount percentage (0 for no discount).
                </FormDescription>
              </div>
              <FormControl>
                 <Input type="number" placeholder="e.g. 15" {...field} value={field.value ?? ''} className="w-24" />
              </FormControl>
               <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? isEditMode ? "Saving..." : "Adding..." 
            : isEditMode ? "Save Changes" : "Add Product"}
        </Button>
      </form>
    </Form>
  )
}
