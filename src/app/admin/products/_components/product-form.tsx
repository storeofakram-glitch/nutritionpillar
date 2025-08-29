
"use client"

import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addProduct, updateProduct } from "@/services/product-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/types"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  buyingPrice: z.coerce.number().min(0, "Buying price must be a non-negative number.").optional(),
  quantity: z.coerce.number().int().min(0, "Quantity must be a non-negative integer."),
  category: z.string({ required_error: "Please select a category."}).min(1, "Please select a category."),
  imageUrl: z.string().url("Please enter a valid image URL."),
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
      imageUrl: product?.imageUrl || "",
    },
  })

  async function onSubmit(data: ProductFormValues) {
    const result = isEditMode
        ? await updateProduct(product.id, data)
        : await addProduct(data);

    if (result.success) {
      toast({
        title: isEditMode ? "Product Updated" : "Product Added",
        description: `"${data.name}" has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      // Only call the onFormSubmit callback on success
      onFormSubmit();
      form.reset(); // Reset form fields after successful submission
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
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
