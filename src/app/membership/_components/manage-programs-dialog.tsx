
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import type { CoachingApplication } from '@/types';
import { BookMarked } from 'lucide-react';
import { updateApplicationPlans } from '@/services/application-service';

const programsFormSchema = z.object({
  nutritionPlanUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  trainingPlanUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type ProgramsFormValues = z.infer<typeof programsFormSchema>;

interface ManageProgramsDialogProps {
  application: CoachingApplication;
  onUpdate: () => void;
}

export default function ManageProgramsDialog({ application, onUpdate }: ManageProgramsDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProgramsFormValues>({
    resolver: zodResolver(programsFormSchema),
    defaultValues: {
      nutritionPlanUrl: application.applicant.nutritionPlanUrl || '',
      trainingPlanUrl: application.applicant.trainingPlanUrl || '',
    },
  });

  const onSubmit = async (data: ProgramsFormValues) => {
    const result = await updateApplicationPlans(application.id, {
        nutritionPlanUrl: data.nutritionPlanUrl,
        trainingPlanUrl: data.trainingPlanUrl,
    });

    if (result.success) {
      toast({
        title: "Plans Updated",
        description: `Programs for ${application.applicant.name} have been saved.`,
      });
      onUpdate();
      setOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to update plans.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <BookMarked className="h-4 w-4 mr-2" />
            Manage Programs
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Programs for {application.applicant.name}</DialogTitle>
          <DialogDescription>
            Add or update the links to your client's nutrition and training plans.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="nutritionPlanUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nutrition Plan URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/nutrition-plan" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="trainingPlanUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Training Plan URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/training-plan" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Plans"}
                </Button>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
