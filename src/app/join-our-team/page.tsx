
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTeamApplication } from '@/services/join-team-service';
import { countryCodes } from '@/lib/country-codes';
import { Combobox } from '@/components/ui/combobox';

const joinTeamFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  countryCode: z.string().min(1, "Country code is required."),
  phone: z.string().min(1, "Phone number is required."),
  position: z.enum(['Coach', 'Expert'], { required_error: "Please select a position." }),
  specialty: z.string({ required_error: "Please select a specialty."}),
  resumeUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  message: z.string().min(20, { message: "Your message should be at least 20 characters." }),
  tiktokUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  instagramUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedinUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type JoinTeamFormValues = z.infer<typeof joinTeamFormSchema>;

const specialties = ["Fitness", "Bodybuilding", "Nutrition", "Powerlifting", "CrossFit", "Calisthenics"];

const countryCodeOptions = countryCodes.map(country => ({
    value: country.dial_code,
    label: `${country.name} (${country.dial_code})`,
}));


export default function JoinTeamPage() {
  const { toast } = useToast();
  const form = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamFormSchema),
    defaultValues: {
      name: '',
      email: '',
      countryCode: '+213',
      phone: '',
      position: undefined,
      specialty: undefined,
      resumeUrl: '',
      message: '',
      tiktokUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
    },
  });

  const onSubmit = async (data: JoinTeamFormValues) => {
    const fullPhoneNumber = `${data.countryCode}${data.phone}`;
      
    const result = await addTeamApplication({
        ...data,
        phone: fullPhoneNumber,
    });

    if (result.success) {
      toast({
        title: "Application Sent!",
        description: "Thank you for your interest in joining our team. We will review your application and get back to you.",
      });
      form.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "There was a problem sending your application. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Join Our Team</CardTitle>
                    <CardDescription className="text-lg">
                        We're looking for passionate individuals to join us on our mission. If you're ready to make an impact, we'd love to hear from you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <div className="grid sm:grid-cols-2 gap-6">
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="countryCode"
                                            render={({ field }) => (
                                                <Combobox
                                                    options={countryCodeOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select code..."
                                                    searchPlaceholder="Search code..."
                                                    notFoundText="No country found."
                                                    triggerClassName="w-32"
                                                />
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                            <FormControl><Input type="tel" placeholder="Phone Number" {...field} /></FormControl>
                                            )}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                 <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a position" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Coach">Coach</SelectItem>
                                                <SelectItem value="Expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="specialty"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Specialty</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a specialty" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="resumeUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resume/Portfolio Link (Optional)</FormLabel>
                                    <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Social Links (Optional)</p>
                                <div className="grid sm:grid-cols-3 gap-4">
                                     <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">TikTok</FormLabel>
                                            <FormControl><Input placeholder="TikTok URL" {...field} value={field.value ?? ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Instagram</FormLabel>
                                            <FormControl><Input placeholder="Instagram URL" {...field} value={field.value ?? ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">LinkedIn</FormLabel>
                                            <FormControl><Input placeholder="LinkedIn URL" {...field} value={field.value ?? ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Why do you want to join our team?</FormLabel>
                                    <FormControl><Textarea placeholder="Tell us a bit about yourself and why you'd be a great fit..." rows={6} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full font-bold" size="lg" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

