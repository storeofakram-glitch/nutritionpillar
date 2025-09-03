
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
import { addMembership, updateMembership } from "@/services/membership-service"
import type { Membership, Product } from "@/types"
import { useEffect, useState, useMemo } from "react"
import { getProducts } from "@/services/product-service"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const recommendedProductSchema = z.object({
  productId: z.string(),
  usage: z.string().min(1, "Usage instructions are required."),
});

const membershipSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  coachingPlan: z.string().min(2, "Coaching plan is required."),
  goal: z.string().optional(),
  membershipDurationDays: z.coerce.number().int().min(0, "Duration must be a positive number.").optional(),
  recommendedProducts: z.array(recommendedProductSchema).optional(),
  codeGenerationMethod: z.enum(['auto', 'manual']).default('auto'),
  code: z.string().optional(),
}).refine(data => {
    if (data.codeGenerationMethod === 'manual') {
        return !!data.code && data.code.length > 0;
    }
    return true;
}, {
    message: "Manual code cannot be empty.",
    path: ["code"],
});


type MembershipFormValues = z.infer<typeof membershipSchema>

interface MembershipFormProps {
  onFormSubmit: () => void;
  membership?: Membership;
}

const fitnessGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Performance",
    "General Health",
    "Body Recomposition",
];

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
      goal: membership?.goal || "",
      membershipDurationDays: 0,
      recommendedProducts: membership?.recommendedProducts || [],
      codeGenerationMethod: 'auto',
      code: '',
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "recommendedProducts",
  });
  
  const watchRecommendedProducts = form.watch('recommendedProducts');

  const watchCodeGenerationMethod = form.watch('codeGenerationMethod');

  async function onSubmit(data: MembershipFormValues) {
    if (isEditMode && membership) {
      const result = await updateMembership(membership.id, {
        recommendedProducts: data.recommendedProducts || [],
      });
      if (result.success) {
        toast({
          title: "Membership Updated",
          description: `Recommendations for "${membership.customerName}" have been successfully updated.`,
        });
        onFormSubmit();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Something went wrong." });
      }
      return;
    }

    // Add mode logic
    const membershipData: Partial<Membership> & { membershipDurationDays?: number } = {
      customerName: data.customerName,
      coachingPlan: data.coachingPlan,
      goal: data.goal,
      membershipDurationDays: data.membershipDurationDays,
      type: 'Coaching',
      recommendedProducts: [], // Recommendations are added in edit mode
    };

    if (data.codeGenerationMethod === 'manual') {
      membershipData.code = data.code;
    }

    const result = await addMembership(membershipData);

    if (result.success) {
      toast({
        title: "Membership Added",
        description: `Membership for "${data.customerName}" has been successfully added.`,
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
                 <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fitness Goal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the client's goal" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {fitnessGoals.map((goal) => (
                                <SelectItem key={goal} value={goal}>
                                {goal}
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
                    name="membershipDurationDays"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Membership Duration (in days)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 90" {...field} value={field.value ?? ''} /></FormControl>
                        <FormDescription>Leave at 0 for no expiration.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="codeGenerationMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Membership Code</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="auto" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Generate Automatically
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="manual" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Enter Manually
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchCodeGenerationMethod === 'manual' && (
                    <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Manual Code</FormLabel>
                        <FormControl><Input placeholder="Enter unique code" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </>
        ) : (
             <div className="space-y-4">
                <div className="mb-4">
                    <FormLabel className="text-base">Supplement Guide</FormLabel>
                    <FormDescription>
                        Select products to recommend and provide usage instructions.
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
                    <div className="p-4 space-y-4">
                        {loadingProducts ? <p>Loading products...</p> :
                            filteredProducts.map((product) => {
                                const recommendedProductIndex = watchRecommendedProducts?.findIndex(p => p.productId === product.id) ?? -1;
                                const isChecked = recommendedProductIndex > -1;

                                return (
                                <div key={product.id} className="space-y-2">
                                    <div className="flex flex-row items-start space-x-3 space-y-0">
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    append({ productId: product.id, usage: "" });
                                                } else {
                                                    const indexToRemove = fields.findIndex(f => f.productId === product.id);
                                                    if(indexToRemove > -1) remove(indexToRemove);
                                                }
                                            }}
                                        />
                                        <FormLabel className="font-normal flex-grow">{product.name}</FormLabel>
                                    </div>
                                    {isChecked && (
                                        <div className="pl-6">
                                            <FormField
                                                control={form.control}
                                                name={`recommendedProducts.${recommendedProductIndex}.usage`}
                                                render={({ field }) => (
                                                  <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">Usage Instructions</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="e.g., 1 scoop with water, 30 mins pre-workout" rows={2} />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                                )
                            })
                        }
                        {filteredProducts.length === 0 && !loadingProducts && (
                            <p className="text-center text-sm text-muted-foreground">No products found.</p>
                        )}
                    </div>
                </ScrollArea>
             </div>
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
