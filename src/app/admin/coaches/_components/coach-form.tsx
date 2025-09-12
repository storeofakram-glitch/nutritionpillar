
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
import { addCoach, updateCoach } from "@/services/coach-service"
import type { Coach } from "@/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dumbbell, PlusCircle, Trash2, Zap, HeartPulse, User, Rocket } from "lucide-react"

const planSchema = z.object({
    icon: z.string().min(1, "Icon is required."),
    title: z.string().min(2, "Plan title is required."),
    description: z.string().min(10, "Description is required."),
    price: z.coerce.number().min(0, "Price must be a non-negative number."),
    pricePeriod: z.enum(['month', 'program']),
    applyLink: z.string().url("Must be a valid URL."),
});

const coachSchema = z.object({
  name: z.string().min(2, "Name is required."),
  type: z.enum(['Coach', 'Expert'], { required_error: "Please select a type." }),
  specialty: z.string().min(2, "Specialty is required."),
  imageUrl: z.string().url("Must be a valid URL."),
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5.").max(5, "Rating must be between 1 and 5."),
  bio: z.string().optional(),
  certifications: z.array(z.object({ value: z.string().min(1, "Certification cannot be empty.") })).optional(),
  plans: z.array(planSchema).optional(),
})

type CoachFormValues = z.infer<typeof coachSchema>

interface CoachFormProps {
  onFormSubmit: () => void;
  coach?: Coach;
}

const specialties = ["Fitness", "Nutrition", "Wellness", "Bodybuilding", "Powerlifting", "Yoga", "CrossFit"];
const planIcons = [
    { name: "Personal Training", icon: Dumbbell },
    { name: "Online Coaching", icon: Zap },
    { name: "Nutrition Plan", icon: HeartPulse },
    { name: "VIP Program", icon: Rocket },
];


export function CoachForm({ onFormSubmit, coach }: CoachFormProps) {
  const { toast } = useToast()
  const isEditMode = !!coach;

  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      name: coach?.name || "",
      type: coach?.type || "Coach",
      specialty: coach?.specialty || "",
      imageUrl: coach?.imageUrl || "",
      rating: coach?.rating || 5,
      bio: coach?.bio || "",
      certifications: coach?.certifications?.map(c => ({ value: c })) || [{ value: "" }],
      plans: coach?.plans || [],
    },
  })

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: form.control,
    name: "certifications"
  });

  const { fields: planFields, append: appendPlan, remove: removePlan } = useFieldArray({
    control: form.control,
    name: "plans"
  });

  async function onSubmit(data: CoachFormValues) {
    const coachData = {
        ...data,
        certifications: data.certifications?.map(c => c.value).filter(Boolean),
        plans: data.plans,
    };
    
    const result = isEditMode
        ? await updateCoach(coach.id, coachData)
        : await addCoach(coachData);

    if (result.success) {
      toast({
        title: isEditMode ? "Details Updated" : "Person Added",
        description: `"${data.name}" has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      onFormSubmit();
      if (!isEditMode) {
        form.reset();
      }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter full name" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3"><FormLabel>Type</FormLabel><FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Coach" /></FormControl><FormLabel className="font-normal">Coach</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Expert" /></FormControl><FormLabel className="font-normal">Expert</FormLabel></FormItem>
                </RadioGroup>
            </FormControl><FormMessage /></FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a specialty" /></SelectTrigger></FormControl>
                        <SelectContent>{specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                     <FormControl>
                        <Input type="number" step="0.1" min="1" max="5" placeholder="e.g., 4.5" {...field} />
                     </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormDescription>Use a square (1:1) image. Recommended size: 400x400 pixels.</FormDescription><FormMessage /></FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="A short bio about the person" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        
        <div className="space-y-3 p-4 border rounded-lg">
          <FormLabel>Certifications (Optional)</FormLabel>
          {certFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`certifications.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder={`Certification ${index + 1}`} {...field} />
                    </FormControl>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(index)} disabled={certFields.length === 1 && !certFields[0].value}>
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
            onClick={() => appendCert({ value: "" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
            <FormLabel>Coaching Plans (Optional)</FormLabel>
            {planFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePlan(index)} className="absolute top-2 right-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <FormField
                        control={form.control}
                        name={`plans.${index}.icon`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan Icon</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger></FormControl>
                                    <SelectContent>{planIcons.map(icon => <SelectItem key={icon.name} value={icon.name}>{icon.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control} name={`plans.${index}.title`}
                        render={({ field }) => ( <FormItem><FormLabel>Plan Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Personal Training" /></FormControl><FormMessage /></FormItem> )}
                     />
                    <FormField
                        control={form.control} name={`plans.${index}.description`}
                        render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Briefly describe this plan" rows={3} /></FormControl><FormMessage /></FormItem> )}
                     />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control} name={`plans.${index}.price`}
                            render={({ field }) => ( <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 5000" /></FormControl><FormMessage /></FormItem> )}
                        />
                        <FormField
                            control={form.control} name={`plans.${index}.pricePeriod`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Per</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="month">Month</SelectItem>
                                        <SelectItem value="program">Program</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                     <FormField
                        control={form.control} name={`plans.${index}.applyLink`}
                        render={({ field }) => ( <FormItem><FormLabel>Apply Link</FormLabel><FormControl><Input {...field} placeholder="https://example.com/apply" /></FormControl><FormMessage /></FormItem> )}
                     />
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendPlan({ icon: "Dumbbell", title: "", description: "", price: 0, pricePeriod: "month", applyLink: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Plan
            </Button>
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Person")}
        </Button>
      </form>
    </Form>
  )
}

    