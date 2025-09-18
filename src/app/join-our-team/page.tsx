

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTeamApplication } from '@/services/join-team-service';
import { countryCodes } from '@/lib/country-codes';
import { Combobox } from '@/components/ui/combobox';
import { Checkbox } from '@/components/ui/checkbox';
import { Handshake, Feather, Heart, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dzStates } from '@/lib/dz-states';


const joinTeamFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old to apply." }),
  countryCode: z.string().min(1, "Country code is required."),
  phone: z.string().min(1, "Phone number is required."),
  address: z.string().min(2, "Address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  nationality: z.string().min(1, "Nationality is required."),
  position: z.enum(['Coach', 'Expert'], { required_error: "Please select a position." }),
  specialty: z.string({ required_error: "Please select a specialty."}),
  certifications: z.array(z.string()).optional(),
  otherCertification: z.string().optional(),
  resumeUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  message: z.string().optional(),
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
      address: '',
      city: '',
      state: undefined,
      country: undefined,
      nationality: undefined,
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
        age: data.age,
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
                  <Handshake className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl text-foreground">Become a Part of Our Story</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-muted-foreground space-y-2">
                    <p>Join us and inspire others with your expertise. Track your progress and impact as a distinguished coach or expert.</p>
                    <p dir="rtl" className="font-medium">انضم معنا وألهم الآخرين من خلال خبرتك. تتبع تقدمك وأثرَك كمدرب أو خبير مميز.</p>
                </div>
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

            <div className="mx-auto max-w-4xl w-full bg-gray-900 rounded-2xl border border-cyan-500 p-6 md:p-8 shadow-lg shadow-cyan-500/20">
                <h3 className="text-xl font-bold text-white text-center mb-6">🌟 Why Join Our Community?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
                        <div className="text-4xl mb-3">🌍</div>
                        <h4 className="font-bold text-white">Global Reach</h4>
                        <p className="text-gray-300 text-sm">Connect with clients from around the world.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
                        <div className="text-4xl mb-3">⏰</div>
                        <h4 className="font-bold text-white">Flexible Schedule</h4>
                        <p className="text-gray-300 text-sm">Work on your own terms and set your own hours.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
                        <div className="text-4xl mb-3">🚀</div>
                        <h4 className="font-bold text-white">Career Growth</h4>
                        <p className="text-gray-300 text-sm">Access opportunities for professional development.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
                        <div className="text-4xl mb-3">📚</div>
                        <h4 className="font-bold text-white">Resource Access</h4>
                        <p className="text-gray-300 text-sm">Utilize our library of tools and educational materials.</p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl w-full bg-gray-900 rounded-2xl border border-cyan-500 p-6 md:p-8 shadow-lg shadow-cyan-500/20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">🚀 Ready to Make an Impact?</h2>
                    <p className="text-lg text-gray-400 mt-2">
                        Fill out the form below to apply and become part of our growing community.
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-bold">Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your full name" {...field} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-bold">Email Address</FormLabel>
                                    <FormControl><Input type="email" placeholder="your.email@example.com" {...field} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-bold">Age</FormLabel>
                                    <FormControl><Input type="number" placeholder="Your age" {...field} value={field.value || ''} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid sm:grid-cols-2 gap-6">
                            <FormItem>
                                <FormLabel className="text-white font-bold">Phone Number</FormLabel>
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
                                                triggerClassName={cn(
                                                    "justify-between",
                                                    "bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500",
                                                    "w-auto"
                                                )}
                                            />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                        <FormControl><Input type="tel" placeholder="Phone Number" {...field} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                        )}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                             <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white font-bold">Address</FormLabel>
                                        <FormControl><Input placeholder="Street Address" {...field} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white font-bold">City</FormLabel>
                                        <FormControl><Input placeholder="City" {...field} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-bold">State (Wilaya)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500">
                                            <SelectValue placeholder="Select a state" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {dzStates.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-bold">Country</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500">
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {countryCodes.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="nationality"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-bold">Nationality</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500">
                                            <SelectValue placeholder="Select a nationality" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {countryCodes.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-white font-bold">Position</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500">
                                        <SelectValue placeholder="Select a position" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        <SelectItem value="Coach">Coach</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="specialty"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-white font-bold">Specialty</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500">
                                        <SelectValue placeholder="Select a specialty" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
                                <FormItem className="rounded-xl border border-gray-700 bg-gray-800 p-4">
                                    <div className="mb-4">
                                    <FormLabel className="text-base text-white font-bold">Certifications for {selectedSpecialty}</FormLabel>
                                    <FormDescription className="text-gray-400">
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
                                                className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    className="border-gray-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white"
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
                                                <FormLabel className="font-normal text-gray-300">
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
                                                        className="border-gray-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white"
                                                        checked={field.value?.includes('Other')}
                                                        onCheckedChange={(checked) => {
                                                            const newValue = checked
                                                                ? [...(field.value || []), 'Other']
                                                                : field.value?.filter((value) => value !== 'Other');
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal text-gray-300">Other</FormLabel>
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
                                                        <Input {...field} placeholder="Please specify your certification" className="bg-gray-700 border-gray-600 text-white rounded-lg" />
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
                                <FormLabel className="text-white font-bold">Resume/Portfolio Link (Optional)</FormLabel>
                                <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value ?? ''} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-white font-bold">Social Links (Optional)</p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                 <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-gray-400">TikTok</FormLabel>
                                        <FormControl><Input placeholder="TikTok URL" {...field} value={field.value ?? ''} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-gray-400">Instagram</FormLabel>
                                        <FormControl><Input placeholder="Instagram URL" {...field} value={field.value ?? ''} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-gray-400">LinkedIn</FormLabel>
                                        <FormControl><Input placeholder="LinkedIn URL" {...field} value={field.value ?? ''} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                        <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white font-bold">Why do you want to join our team? (Optional)</FormLabel>
                                <FormControl><Textarea placeholder="Tell us a bit about yourself and why you'd be a great fit..." rows={6} {...field} className="bg-gray-800 border-gray-700 text-white rounded-xl p-3 focus:ring-cyan-500 focus:border-cyan-500" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full font-bold bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-lg h-12 transition-all hover:shadow-lg hover:shadow-cyan-500/30" size="lg" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    </div>
  );
}
