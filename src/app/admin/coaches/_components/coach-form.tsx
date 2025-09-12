
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
import { PlusCircle, Trash2 } from "lucide-react"

const coachSchema = z.object({
  name: z.string().min(2, "Name is required."),
  type: z.enum(['Coach', 'Expert'], { required_error: "Please select a type." }),
  specialty: z.string().min(2, "Specialty is required."),
  imageUrl: z.string().url("Must be a valid URL."),
  rating: z.coerce.number().int().min(1).max(5),
  bio: z.string().optional(),
  certifications: z.array(z.object({ value: z.string().min(1, "Certification cannot be empty.") })).optional(),
})

type CoachFormValues = z.infer<typeof coachSchema>

interface CoachFormProps {
  onFormSubmit: () => void;
  coach?: Coach;
}

const specialties = ["Fitness", "Nutrition", "Wellness", "Bodybuilding", "Powerlifting", "Yoga", "CrossFit"];
const ratings = [1, 2, 3, 4, 5];

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
    },
  })

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: form.control,
    name: "certifications"
  });

  async function onSubmit(data: CoachFormValues) {
    const coachData = {
        ...data,
        certifications: data.certifications?.map(c => c.value).filter(Boolean),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>Rating</FormLabel>
                     <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger></FormControl>
                        <SelectContent>{ratings.map(r => <SelectItem key={r} value={String(r)}>{r} star{r>1 && 's'}</SelectItem>)}</SelectContent>
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
        
        <div className="space-y-3">
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
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(index)} disabled={certFields.length <= 1 && !certFields[0].value}>
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
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Person")}
        </Button>
      </form>
    </Form>
  )
}
