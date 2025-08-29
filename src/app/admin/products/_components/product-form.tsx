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
import { addProduct } from "@/services/product-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  quantity: z.coerce.number().int().min(0, "Quantity must be a non-negative integer."),
  category: z.string({ required_error: "Please select a category."}).min(2, "Category must be at least 2 characters."),
  imageUrl: z.string().url("Please enter a valid image URL."),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  onFormSubmit: () => void;
}

const categories = [
    "Protein",
    "Performance",
    "Pre-Workout",
    "Health & Wellness",
]

export function ProductForm({ onFormSubmit }: ProductFormProps) {
  const { toast } = useToast()
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      category: "",
      imageUrl: "",
    },
  })

  async function onSubmit(data: ProductFormValues) {
    const result = await addProduct(data);
    if (result.success) {
      toast({
        title: "Product Added",
        description: `"${data.name}" has been successfully added.`,
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
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="49.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
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
        </div>
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
          {form.formState.isSubmitting ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </Form>
  )
}
