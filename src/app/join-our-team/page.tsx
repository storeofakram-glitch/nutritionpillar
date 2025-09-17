
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTeamApplication } from '@/services/join-team-service';
import { countryCodes } from '@/lib/country-codes';
import { Combobox } from '@/components/ui/combobox';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Feather, Heart, CheckCircle2 } from 'lucide-react';

const joinTeamFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old to apply." }),
  countryCode: z.string().min(1, "Country code is required."),
  phone: z.string().min(1, "Phone number is required."),
  position: z.enum(['Coach', 'Expert'], { required_error: "Please select a position." }),
  specialty: z.string({ required_error: "Please select a specialty."}),
  certifications: z.array(z.string()).optional(),
  otherCertification: z.string().optional(),
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

const certificationsBySpecialty = {
    Powerlifting: [
        "IPF (International Powerlifting Federation): IPF Coaching License",
        "USPA (United States Powerlifting Association): USPA Coach Certification",
        "WDFPF (World Drug-Free Powerlifting Federation): WDFPF Coach Certification",
    ],
    Bodybuilding: [
        "NASM (National Academy of Sports Medicine): Certified Personal Trainer (CPT)",
        "ACE (American Council on Exercise): Certified Personal Trainer",
        "ISSA (International Sports Sciences Association): Certified Personal Trainer",
        "IFBB (International Federation of Bodybuilding and Fitness) Academy: Coach, Nutrition, and Bodybuilding Master Certifications",
    ],
    Fitness: [
        "NASM (National Academy of Sports Medicine): Certified Personal Trainer (CPT)",
        "ACE (American Council on Exercise): Certified Personal Trainer",
        "ISSA (International Sports Sciences Association): Certified Personal Trainer",
    ],
    Nutrition: [
        "Precision Nutrition (PN): PN Level 1 Nutrition Certification",
        "NASM (National Academy of Sports Medicine): Certified Nutrition Coach (CNC)",
        "ISSA (International Sports Sciences Association): Certified Nutritionist",
    ],
    CrossFit: [
        "CrossFit: CrossFit Level 1 Trainer (CF-L1)",
    ],
    Calisthenics: [
        "WSWCF (World Street Workout and Calisthenics Federation) Academy",
        "GMB Fitness",
    ]
};

const requirements = [
    { text: "Passion for fitness and helping others" },
    { text: "Relevant certification or proven experience" },
    { text: "Commitment to professionalism and reliability" },
    { text: "Ability to work flexibly with clients online" },
];


export default function JoinTeamPage() {
  const { toast } = useToast();
  const form = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamFormSchema),
    defaultValues: {
      name: '',
      email: '',
      age: undefined,
      countryCode: '+213',
      phone: '',
      position: undefined,
      specialty: undefined,
      certifications: [],
      otherCertification: '',
      resumeUrl: '',
      message: '',
      tiktokUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
    },
  });

  const selectedSpecialty = form.watch('specialty') as keyof typeof certificationsBySpecialty;
  const watchCertifications = form.watch('certifications');

  const onSubmit = async (data: JoinTeamFormValues) => {
    const fullPhoneNumber = `${data.countryCode}${data.phone}`;
    
    // Combine selected certifications with the "Other" value if present
    const allCertifications = [...(data.certifications || [])];
    if (data.otherCertification) {
        allCertifications.push(data.otherCertification);
    }
      
    const result = await addTeamApplication({
        ...data,
        phone: fullPhoneNumber,
        certifications: allCertifications,
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
        <div className="max-w-3xl mx-auto space-y-8">
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 gradient-border">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                  <Briefcase className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl text-foreground">Become a Part of Our Story</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">We believe in passion, expertise, and the drive to make a difference. If you're ready to inspire others and grow with a leading brand in fitness, we invite you to apply below.</p>
              </CardContent>
            </Card>

            <div className="mx-auto max-w-3xl w-full bg-gray-900 rounded-2xl border border-cyan-500 p-6 md:p-8 shadow-lg shadow-cyan-500/20">
                <h3 className="text-xl font-bold text-white text-center mb-6">✅ What You Need Before Applying</h3>
                <div className="space-y-4">
                    {requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-4 rounded-xl bg-gray-800 p-4 transition-colors hover:bg-gray-700/50">
                            <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                            <p className="text-gray-300">{req.text}</p>
                        </div>
                    ))}
                </div>
            </div>

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
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl><Input type="number" placeholder="Your age" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid sm:grid-cols-2 gap-6">
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <div className="flex gap-3">
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
                                                    triggerClassName="flex-shrink-0"
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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

                            {selectedSpecialty && certificationsBySpecialty[selectedSpecialty] && (
                                <FormField
                                    control={form.control}
                                    name="certifications"
                                    render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                        <FormLabel className="text-base">Certifications for {selectedSpecialty}</FormLabel>
                                        <FormDescription>
                                            Select all the certifications you hold.
                                        </FormDescription>
                                        </div>
                                        {certificationsBySpecialty[selectedSpecialty].map((item) => (
                                        <FormField
                                            key={item}
                                            control={form.control}
                                            name="certifications"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={item}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                (value) => value !== item
                                                                )
                                                            )
                                                        }}
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                    {item}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                         <FormField
                                            control={form.control}
                                            name="certifications"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes('Other')}
                                                            onCheckedChange={(checked) => {
                                                                const newValue = checked
                                                                    ? [...(field.value || []), 'Other']
                                                                    : field.value?.filter((value) => value !== 'Other');
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Other</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        {watchCertifications?.includes('Other') && (
                                            <FormField
                                                control={form.control}
                                                name="otherCertification"
                                                render={({ field }) => (
                                                    <FormItem className="pl-6 pt-2">
                                                        <FormControl>
                                                            <Input {...field} placeholder="Please specify your certification" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}

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

    