
"use client"

import { useForm } from "react-hook-form"
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
import { addMembership, updateMembership } from "@/services/membership-service"
import type { Membership, Product } from "@/types"
import { useEffect, useState, useMemo } from "react"
import { getProducts } from "@/services/product-service"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

const membershipSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  coachingPlan: z.string().min(2, "Coaching plan is required."),
  recommendedProductIds: z.array(z.string()).optional(),
})

type MembershipFormValues = z.infer<typeof membershipSchema>

interface MembershipFormProps {
  onFormSubmit: () => void;
  membership?: Membership;
}

export function MembershipForm({ onFormSubmit, membership }: MembershipFormProps) {
  const { toast } = useToast()
  const isEditMode = !!membership;
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadProducts() {
        setLoadingProducts(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setLoadingProducts(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      customerName: membership?.customerName || "",
      coachingPlan: membership?.coachingPlan || "",
      recommendedProductIds: membership?.recommendedProductIds || [],
    },
  })

  async function onSubmit(data: MembershipFormValues) {
    const commonData = {
        customerName: data.customerName,
        coachingPlan: data.coachingPlan,
        recommendedProductIds: data.recommendedProductIds || [],
    }

    const result = isEditMode
        ? await updateMembership(membership.id, commonData)
        : await addMembership({ ...commonData, type: 'Coaching', recommendedProductIds: [] }); // Recommendations are added in edit mode.

    if (result.success) {
      toast({
        title: isEditMode ? "Membership Updated" : "Membership Added",
        description: `Membership for "${data.customerName}" has been successfully ${isEditMode ? 'updated' : 'added'}.`,
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
        
        {!isEditMode ? (
            <>
                <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="coachingPlan"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Coaching Plan</FormLabel>
                    <FormControl><Input placeholder="e.g., 12-Week Transformation" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </>
        ) : (
             <FormField
                control={form.control}
                name="recommendedProductIds"
                render={() => (
                    <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Recommended Products</FormLabel>
                        <FormDescription>
                        Select the products to recommend to this member.
                        </FormDescription>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <ScrollArea className="h-60 w-full rounded-md border">
                        <div className="p-4 space-y-2">
                        {loadingProducts ? <p>Loading products...</p> : 
                            filteredProducts.map((product) => (
                                <FormField
                                key={product.id}
                                control={form.control}
                                name="recommendedProductIds"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={product.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(product.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), product.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== product.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {product.name}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))
                        }
                        {filteredProducts.length === 0 && !loadingProducts && (
                            <p className="text-center text-sm text-muted-foreground">No products found.</p>
                        )}
                        </div>
                    </ScrollArea>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? isEditMode ? "Saving..." : "Adding..." 
            : isEditMode ? "Save Changes" : "Add Membership"}
        </Button>
      </form>
    </Form>
  )
}
