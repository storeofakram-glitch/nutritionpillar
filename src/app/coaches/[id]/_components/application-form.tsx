
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addSubmission } from '@/services/contact-service';
import type { Plan } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fitnessGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Performance",
    "General Health",
    "Body Recomposition",
];

const applicationFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  age: z.coerce.number().int().positive("Age must be a positive number."),
  weight: z.coerce.number().positive("Weight must be a positive number."),
  height: z.coerce.number().int().positive("Height must be a positive number."),
  goal: z.string({ required_error: "Please select your primary fitness goal." }),
  duration: z.enum(['1 month', '3 months', '6 months', '1 year'], { required_error: "Please select a duration." }),
  message: z.string().optional(),
});


type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationFormProps {
  plan: Plan;
  coachName: string;
  onSuccess: () => void;
}

export function ApplicationForm({ plan, coachName, onSuccess }: ApplicationFormProps) {
  const { toast } = useToast();
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    const subject = `Coaching Application: ${plan.title} - ${coachName}`;
    const messageBody = `
      A new application has been submitted for the "${plan.title}" plan with ${coachName}.

      Applicant Details:
      - Name: ${data.name}
      - Email: ${data.email}
      - Phone: ${data.phone}
      - Age: ${data.age}
      - Weight: ${data.weight} kg
      - Height: ${data.height} cm
      - Duration: ${data.duration}
      - Goal: ${data.goal}

      Additional Message:
      ${data.message || "None"}
    `;

    const result = await addSubmission({ name: data.name, email: data.email, subject, message: messageBody });

    if (result.success) {
      toast({
        title: "Application Sent!",
        description: "Thank you for your interest. We will get back to you shortly.",
      });
      form.reset();
      onSuccess();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "There was an issue sending your application.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Your Email" {...field} /></FormControl><FormMessage /></FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Your Phone Number" {...field} /></FormControl><FormMessage /></FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl><FormMessage /></FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
                <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
                <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 180" {...field} /></FormControl><FormMessage /></FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Coaching Duration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a duration" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="1 month">1 Month</SelectItem>
                        <SelectItem value="3 months">3 Months</SelectItem>
                        <SelectItem value="6 months">6 Months</SelectItem>
                        <SelectItem value="1 year">1 Year</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Your Fitness Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your primary goal" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {fitnessGoals.map(goal => (
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
          name="message"
          render={({ field }) => (
            <FormItem><FormLabel>Additional Message (Optional)</FormLabel><FormControl><Textarea placeholder="Any questions or extra information..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}
