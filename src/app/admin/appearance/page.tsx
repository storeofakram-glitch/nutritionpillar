

// This is a new file for the Appearance management page in the admin dashboard.
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSiteSettings, saveSiteSettings } from "@/services/site-settings-service";
import type { SiteSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2, ChevronDown, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const translatedTextSchema = z.object({
  en: z.string().min(1, { message: "English text is required." }),
  ar: z.string().min(1, { message: "Arabic text is required." }),
});

// Schemas for form validation
const heroSettingsSchema = z.object({
    imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
    videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    alt: z.string().min(1, { message: "Alt text is required." }),
    title: z.string().min(1, { message: "Title is required." }),
    description: translatedTextSchema,
    buttonText: z.string().min(1, { message: "Button text is required." }),
    buttonLink: z.string().min(1, { message: "Button link is required." }),
    button2Text: translatedTextSchema.optional(),
    button2Link: z.string().optional(),
});

const coreServiceSchema = z.object({
    title: translatedTextSchema,
    description: translatedTextSchema,
    buttonText: translatedTextSchema,
    buttonLink: z.string().min(1, "Button link is required."),
});

const coreServicesSettingsSchema = z.object({
    heading: translatedTextSchema,
    subheading: translatedTextSchema,
    services: z.tuple([coreServiceSchema, coreServiceSchema]),
});

const marqueeMessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty."),
  logoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  logoAlt: z.string().optional(),
});

const logoSchema = z.object({
  src: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
  alt: z.string().min(1, { message: "Alt text is required." }),
  hint: z.string().optional(),
  url: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

const adBannerSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
  imageAlt: z.string().min(1, { message: "Alt text is required." }),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  backgroundVideoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  buttonText: z.string().min(1, { message: "Button text is required." }),
  buttonLink: z.string().min(1, { message: "Button link is required." }),
  counter1Value: z.coerce.number().optional(),
  counter1Label: z.string().optional(),
  counter2Value: z.coerce.number().optional(),
  counter2Label: z.string().optional(),
  flashTitle: z.boolean().optional(),
});


const aboutPageSettingsSchema = z.object({
    title: translatedTextSchema,
    subtitle: translatedTextSchema,
    imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
    imageAlt: z.string().min(1, "Image alt text is required."),
    videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    backgroundVideoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    storyTitle: translatedTextSchema,
    storyContent1: translatedTextSchema,
    storyContent2: translatedTextSchema,
    missionTitle: translatedTextSchema,
    missionContent: translatedTextSchema,
    visionTitle: translatedTextSchema,
    visionContent: translatedTextSchema,
    valuesTitle: translatedTextSchema,
    valuesContent: translatedTextSchema,
});

const faqItemSchema = z.object({
  question: z.string().min(1, "Question cannot be empty."),
  answer: z.string().min(1, "Answer cannot be empty."),
});

const faqPageSettingsSchema = z.object({
  title: z.string().min(1, "Title is required."),
  subtitle: z.string().min(1, "Subtitle is required."),
  faqs: z.array(faqItemSchema),
});

const termsPageSettingsSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(10, "Content is required."),
});

const privacyPageSettingsSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(10, "Content is required."),
});

const socialLinksSchema = z.object({
    facebook: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
    instagram: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
    youtube: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
    linkedin: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
    twitter: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
    mapLocationUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

const siteSettingsSchema = z.object({
  hero: heroSettingsSchema,
  coreServices: coreServicesSettingsSchema,
  marquee: z.object({
    messages: z.array(marqueeMessageSchema)
  }),
  partnershipLogos: z.array(logoSchema),
  adBanner: adBannerSchema,
  aboutPage: aboutPageSettingsSchema,
  faqPage: faqPageSettingsSchema,
  termsPage: termsPageSettingsSchema,
  privacyPage: privacyPageSettingsSchema,
  socialLinks: socialLinksSchema,
  language: z.enum(['en', 'ar']).default('en'),
});

const emptyValues: SiteSettings = {
    hero: { imageUrl: "", videoUrl: "", alt: "", title: "", description: { en: "", ar: "" }, buttonText: "", buttonLink: "", button2Text: { en: "", ar: "" }, button2Link: "" },
    coreServices: {
        heading: { en: "Our Core Services", ar: "خدماتنا الأساسية" },
        subheading: { en: "WHAT WE OFFER", ar: "ماذا نقدم" },
        services: [
            { title: { en: "Premium Supplements", ar: "مكملات ممتازة" }, description: { en: "Explore our curated selection of high-quality supplements, from protein powders to pre-workouts, all designed to fuel your performance.", ar: "استكشف مجموعتنا المختارة من المكملات الغذائية عالية الجودة، من مساحيق البروتين إلى ما قبل التمرين، كلها مصممة لتعزيز أدائك." }, buttonText: { en: "Shop Products", ar: "تسوق المنتجات" }, buttonLink: "#products" },
            { title: { en: "Expert Coaching", ar: "تدريب الخبراء" }, description: { en: "Connect with our team of experienced coaches and experts to get personalized guidance and plans tailored to your specific fitness goals.", ar: "تواصل مع فريقنا من المدربين والخبراء ذوي الخبرة للحصول على إرشادات وخطط شخصية مصممة خصيصًا لأهداف اللياقة البدنية الخاصة بك." }, buttonText: { en: "Find a Coach", ar: "ابحث عن مدرب" }, buttonLink: "#coaches" },
        ]
    },
    marquee: { messages: [{ text: "", logoUrl: "", logoAlt: "" }] },
    partnershipLogos: [{ src: "", alt: "", hint: "", url: "" }],
    adBanner: { imageUrl: "", imageAlt: "", videoUrl: "", backgroundVideoUrl: "", title: "", description: "", buttonText: "", buttonLink: "", counter1Value: 0, counter1Label: '', counter2Value: 0, counter2Label: '', flashTitle: false },
    aboutPage: { title: { en: "", ar: "" }, subtitle: { en: "", ar: "" }, imageUrl: "", imageAlt: "", videoUrl: "", backgroundVideoUrl: "", storyTitle: { en: "", ar: "" }, storyContent1: { en: "", ar: "" }, storyContent2: { en: "", ar: "" }, missionTitle: { en: "", ar: "" }, missionContent: { en: "", ar: "" }, visionTitle: { en: "", ar: "" }, visionContent: { en: "", ar: "" }, valuesTitle: { en: "", ar: "" }, valuesContent: { en: "", ar: "" } },
    faqPage: { title: "", subtitle: "", faqs: [{ question: "", answer: "" }] },
    termsPage: { title: "Terms of Service", content: "Please add your terms of service here." },
    privacyPage: { title: "Privacy Policy", content: "Please add your privacy policy here." },
    socialLinks: { facebook: "", instagram: "", youtube: "", linkedin: "", twitter: "", mapLocationUrl: "" },
    language: 'en',
};


export default function AdminAppearancePage({ authLoading }: { authLoading?: boolean }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isHeroOpen, setIsHeroOpen] = useState(false);
  const [isCoreServicesOpen, setIsCoreServicesOpen] = useState(false);
  const [isMarqueeOpen, setIsMarqueeOpen] = useState(false);
  const [isLogosOpen, setIsLogosOpen] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  const form = useForm<z.infer<typeof siteSettingsSchema>>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: emptyValues,
  });
  
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const settings = await getSiteSettings();
      if (settings) {
        // Ensure nested arrays have default values to avoid uncontrolled component errors
        const messages = settings.marquee?.messages?.map(m => ({ text: m.text || '', logoUrl: m.logoUrl || '', logoAlt: m.logoAlt || '' })) || [];
        const partnershipLogos = settings.partnershipLogos?.map(l => ({ ...l, src: l.src || '', alt: l.alt || '', url: l.url || '' })) || [];
        const faqs = settings.faqPage?.faqs?.map(f => ({ question: f.question || '', answer: f.answer || '' })) || [];
        
        form.reset({
             hero: { ...emptyValues.hero, ...settings.hero },
             coreServices: { ...emptyValues.coreServices, ...settings.coreServices },
             marquee: { messages: messages.length > 0 ? messages : emptyValues.marquee.messages }, 
             partnershipLogos: partnershipLogos.length > 0 ? partnershipLogos : emptyValues.partnershipLogos,
             adBanner: { ...emptyValues.adBanner, ...settings.adBanner },
             aboutPage: { ...emptyValues.aboutPage, ...settings.aboutPage },
             faqPage: { 
                title: settings.faqPage?.title || emptyValues.faqPage.title,
                subtitle: settings.faqPage?.subtitle || emptyValues.faqPage.subtitle,
                faqs: faqs.length > 0 ? faqs : emptyValues.faqPage.faqs,
             },
             termsPage: { ...emptyValues.termsPage, ...settings.termsPage },
             privacyPage: { ...emptyValues.privacyPage, ...settings.privacyPage },
             socialLinks: { ...emptyValues.socialLinks, ...settings.socialLinks },
             language: settings.language || 'en',
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, [form]);

  const { fields: marqueeFields, append: appendMarquee, remove: removeMarquee } = useFieldArray({
    control: form.control,
    name: "marquee.messages",
  });

  const { fields: logoFields, append: appendLogo, remove: removeLogo } = useFieldArray({
    control: form.control,
    name: "partnershipLogos",
  });
  
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqPage.faqs",
  });

  const onSubmit = async (data: z.infer<typeof siteSettingsSchema>) => {
    const result = await saveSiteSettings(data);
    if (result.success) {
      toast({ title: "Success", description: "Homepage settings have been saved." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };
  
  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Collapsible open={isHeroOpen} onOpenChange={setIsHeroOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Manage the main hero banner on the homepage.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isHeroOpen && "rotate-180")} />
                            <span className="sr-only">{isHeroOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="hero.videoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL (Optional)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://example.com/video.mp4" /></FormControl>
                                <FormDescription>A direct link to a video file (.mp4, .webm). This will autoplay silently in the background and override the image.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fallback Image URL</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://picsum.photos/1920/1080" /></FormControl>
                                <FormDescription>Required. Shown if no video is provided. Recommended aspect ratio: 16:9.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.alt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image Alt Text</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Hero banner image" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter a catchy title" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.description.en" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (English)</FormLabel>
                                <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Enter a short description" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="hero.description.ar" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Arabic)</FormLabel>
                                <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Enter description in Arabic" dir="rtl" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Separator />
                        <p className="text-sm font-medium">Button 1</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="hero.buttonText" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button Text</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} placeholder="Shop Now" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="hero.buttonLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button Link</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} placeholder="/#products" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <Separator />
                        <p className="text-sm font-medium">Button 2 (Optional)</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="hero.button2Text.en" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button Text (English)</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} placeholder="Find Your Coach" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="hero.button2Text.ar" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button Text (Arabic)</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} placeholder="ابحث عن مدربك" dir="rtl" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1">
                             <FormField control={form.control} name="hero.button2Link" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button 2 Link</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} placeholder="/#coaches" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        
        <Collapsible open={isCoreServicesOpen} onOpenChange={setIsCoreServicesOpen}>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Core Services Section</CardTitle>
                        <CardDescription>Manage the two main service cards on the homepage.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isCoreServicesOpen && "rotate-180")} />
                            <span className="sr-only">{isCoreServicesOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-4 rounded-lg border p-4">
                             <h4 className="font-medium">Section Headers</h4>
                             <FormField control={form.control} name="coreServices.subheading.en" render={({ field }) => (
                                <FormItem><FormLabel>Sub-heading (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="coreServices.subheading.ar" render={({ field }) => (
                                <FormItem><FormLabel>Sub-heading (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="coreServices.heading.en" render={({ field }) => (
                                <FormItem><FormLabel>Main Heading (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="coreServices.heading.ar" render={({ field }) => (
                                <FormItem><FormLabel>Main Heading (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                         <div className="space-y-4 rounded-lg border p-4">
                             <h4 className="font-medium">Service Card 1: Supplements</h4>
                             <FormField control={form.control} name="coreServices.services.0.title.en" render={({ field }) => (
                                <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="coreServices.services.0.title.ar" render={({ field }) => (
                                <FormItem><FormLabel>Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="coreServices.services.0.description.en" render={({ field }) => (
                                <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="coreServices.services.0.description.ar" render={({ field }) => (
                                <FormItem><FormLabel>Description (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                              <FormField control={form.control} name="coreServices.services.0.buttonText.en" render={({ field }) => (
                                <FormItem><FormLabel>Button Text (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="coreServices.services.0.buttonText.ar" render={({ field }) => (
                                <FormItem><FormLabel>Button Text (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                         <div className="space-y-4 rounded-lg border p-4">
                             <h4 className="font-medium">Service Card 2: Coaching</h4>
                            <FormField control={form.control} name="coreServices.services.1.title.en" render={({ field }) => (
                                <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="coreServices.services.1.title.ar" render={({ field }) => (
                                <FormItem><FormLabel>Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="coreServices.services.1.description.en" render={({ field }) => (
                                <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="coreServices.services.1.description.ar" render={({ field }) => (
                                <FormItem><FormLabel>Description (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                              <FormField control={form.control} name="coreServices.services.1.buttonText.en" render={({ field }) => (
                                <FormItem><FormLabel>Button Text (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="coreServices.services.1.buttonText.ar" render={({ field }) => (
                                <FormItem><FormLabel>Button Text (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        
        <Collapsible open={isMarqueeOpen} onOpenChange={setIsMarqueeOpen}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Marquee Settings</CardTitle>
                    <CardDescription>Manage the scrolling text and logos at the top of the homepage.</CardDescription>
                </div>
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isMarqueeOpen && "rotate-180")} />
                        <span className="sr-only">{isMarqueeOpen ? 'Collapse' : 'Expand'}</span>
                    </Button>
                </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
                <CardContent className="space-y-4 pt-4">
                    {marqueeFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <div className="flex items-start gap-4">
                            <div className="flex-grow space-y-4">
                                <FormField
                                control={form.control}
                                name={`marquee.messages.${index}.text`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message Text</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder={`Message ${index + 1}`} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name={`marquee.messages.${index}.logoUrl`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL (Optional)</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://example.com/logo.png" /></FormControl>
                                        <FormDescription>Recommended size: 40x40 pixels.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name={`marquee.messages.${index}.logoAlt`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo Alt Text</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="Logo description" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeMarquee(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendMarquee({ text: "", logoUrl: "", logoAlt: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Message
                    </Button>
                </CardContent>
            </CollapsibleContent>
            </Card>
        </Collapsible>


        <Collapsible open={isLogosOpen} onOpenChange={setIsLogosOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Partnership Logos</CardTitle>
                    <CardDescription>Manage the logos displayed in the partnership section.</CardDescription>
                </div>
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isLogosOpen && "rotate-180")} />
                        <span className="sr-only">{isLogosOpen ? 'Collapse' : 'Expand'}</span>
                    </Button>
                </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
            <CardContent className="space-y-6 pt-4">
                {logoFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="flex items-start gap-4">
                        <div className="flex-grow space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`partnershipLogos.${index}.src`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo Image URL</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://example.com/logo.png" /></FormControl>
                                        <FormDescription>Recommended size: 150x75 pixels.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`partnershipLogos.${index}.alt`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alt Text</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="Brand Name" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`partnershipLogos.${index}.url`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL (Optional)</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://company.com" /></FormControl>
                                    <FormDescription>Where the logo links to.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLogo(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendLogo({ src: "", alt: "", hint: "brand logo", url: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Logo
                </Button>
            </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        
        
        <Collapsible open={isBannerOpen} onOpenChange={setIsBannerOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Ad Banner</CardTitle>
                        <CardDescription>Manage the promotional ad banner on the homepage.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isBannerOpen && "rotate-180")} />
                            <span className="sr-only">{isBannerOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                         <FormField control={form.control} name="adBanner.backgroundVideoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Video URL (Autoplay)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://example.com/video.mp4" /></FormControl>
                                <FormDescription>Optional. A direct link to a video file (.mp4, .webm) that will autoplay silently in the background. This will override the embed video and image.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="adBanner.videoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL (Embed)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://www.youtube.com/embed/..." /></FormControl>
                                <FormDescription>Optional. Use the embed URL from YouTube or Vimeo. This will be shown if no background video is set.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="adBanner.imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fallback Image URL</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://picsum.photos/1200/600" /></FormControl>
                                <FormDescription>Required. This is shown if no video URLs are provided.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="adBanner.imageAlt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image Alt Text</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Promotional banner image" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="adBanner.title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter a catchy title" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="adBanner.flashTitle"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Flash Title</FormLabel>
                                    <FormDescription>
                                    Make the title flash with an animation.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="adBanner.description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Enter a short description" /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="adBanner.counter1Value" render={({ field }) => (
                                <FormItem><FormLabel>Counter 1 Value</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="adBanner.counter1Label" render={({ field }) => (
                                <FormItem><FormLabel>Counter 1 Label</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Happy Clients" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="adBanner.counter2Value" render={({ field }) => (
                                <FormItem><FormLabel>Counter 2 Value</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} placeholder="e.g. 50" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="adBanner.counter2Label" render={({ field }) => (
                                <FormItem><FormLabel>Counter 2 Label</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Products Sold" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="adBanner.buttonText" render={({ field }) => (
                                <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="Shop Now" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="adBanner.buttonLink" render={({ field }) => (
                                <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="/#products" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        
        <Collapsible open={isAboutOpen} onOpenChange={setIsAboutOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>About Page Settings</CardTitle>
                        <CardDescription>Manage all the content on the About Us page.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isAboutOpen && "rotate-180")} />
                            <span className="sr-only">{isAboutOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="aboutPage.title.en" render={({ field }) => (
                                <FormItem><FormLabel>Main Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.title.ar" render={({ field }) => (
                                <FormItem><FormLabel>Main Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="aboutPage.subtitle.en" render={({ field }) => (
                                <FormItem><FormLabel>Subtitle (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.subtitle.ar" render={({ field }) => (
                                <FormItem><FormLabel>Subtitle (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name="aboutPage.backgroundVideoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Video URL (Autoplay)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://example.com/video.mp4" /></FormControl>
                                <FormDescription>Optional. Autoplays silently. Overrides embed video and image.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="aboutPage.videoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL (Embed)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://www.youtube.com/embed/..." /></FormControl>
                                <FormDescription>Optional. Use embed URL. Shown if no background video.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Fallback Image URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormDescription>Required. Shown if no video. Recommended aspect ratio: 1:1.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.imageAlt" render={({ field }) => (
                            <FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="aboutPage.storyTitle.en" render={({ field }) => (
                                <FormItem><FormLabel>Story Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="aboutPage.storyTitle.ar" render={({ field }) => (
                                <FormItem><FormLabel>Story Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="aboutPage.storyContent1.en" render={({ field }) => (
                                <FormItem><FormLabel>Story Paragraph 1 (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={4} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="aboutPage.storyContent1.ar" render={({ field }) => (
                                <FormItem><FormLabel>Story Paragraph 1 (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={4} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="aboutPage.storyContent2.en" render={({ field }) => (
                                <FormItem><FormLabel>Story Paragraph 2 (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={4} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.storyContent2.ar" render={({ field }) => (
                                <FormItem><FormLabel>Story Paragraph 2 (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={4} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="aboutPage.missionTitle.en" render={({ field }) => (
                                <FormItem><FormLabel>Mission Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.missionTitle.ar" render={({ field }) => (
                                <FormItem><FormLabel>Mission Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl"/></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="aboutPage.missionContent.en" render={({ field }) => (
                                <FormItem><FormLabel>Mission Content (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.missionContent.ar" render={({ field }) => (
                                <FormItem><FormLabel>Mission Content (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="aboutPage.visionTitle.en" render={({ field }) => (
                                <FormItem><FormLabel>Vision Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.visionTitle.ar" render={({ field }) => (
                                <FormItem><FormLabel>Vision Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="aboutPage.visionContent.en" render={({ field }) => (
                                <FormItem><FormLabel>Vision Content (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="aboutPage.visionContent.ar" render={({ field }) => (
                                <FormItem><FormLabel>Vision Content (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="aboutPage.valuesTitle.en" render={({ field }) => (
                                <FormItem><FormLabel>Values Title (English)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="aboutPage.valuesTitle.ar" render={({ field }) => (
                                <FormItem><FormLabel>Values Title (Arabic)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="aboutPage.valuesContent.en" render={({ field }) => (
                                <FormItem><FormLabel>Values Content (English)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.valuesContent.ar" render={({ field }) => (
                                <FormItem><FormLabel>Values Content (Arabic)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} dir="rtl" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        
        <Collapsible open={isFaqOpen} onOpenChange={setIsFaqOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>FAQ Page Settings</CardTitle>
                        <CardDescription>Manage the title, subtitle, and questions on the FAQ page.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isFaqOpen && "rotate-180")} />
                            <span className="sr-only">{isFaqOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="faqPage.title" render={({ field }) => (
                            <FormItem><FormLabel>Main Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="faqPage.subtitle" render={({ field }) => (
                            <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <div className="space-y-4">
                            <FormLabel>Questions & Answers</FormLabel>
                            {faqFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <div className="flex items-start gap-4">
                                    <div className="flex-grow space-y-2">
                                        <FormField
                                        control={form.control}
                                        name={`faqPage.faqs.${index}.question`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question</FormLabel>
                                                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                        <FormField
                                        control={form.control}
                                        name={`faqPage.faqs.${index}.answer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer</FormLabel>
                                                <FormControl><Textarea {...field} value={field.value ?? ''} rows={3} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(index)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: "", answer: "" })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add FAQ
                            </Button>
                        </div>

                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>

        <Collapsible open={isTermsOpen} onOpenChange={setIsTermsOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Terms of Service Page</CardTitle>
                        <CardDescription>Manage the content of the Terms of Service page.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isTermsOpen && "rotate-180")} />
                            <span className="sr-only">{isTermsOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="termsPage.title" render={({ field }) => (
                            <FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="termsPage.content" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>Content (Markdown supported)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-xs gap-1.5">
                                                <Info className="h-3 w-3" />
                                                Formatting Help
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium leading-none">Markdown Tips</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Use markdown to format your text.
                                                    </p>
                                                </div>
                                                <div className="text-sm">
                                                    <p><code className="font-mono bg-muted p-1 rounded"># Heading 1</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">## Heading 2</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">**Bold Text**</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">*Italic Text*</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">- List Item</code></p>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormControl><Textarea {...field} value={field.value ?? ''} rows={20} /></FormControl>
                                <FormDescription>Use markdown for formatting (e.g., # Heading, * list item).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        
        <Collapsible open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Privacy Policy Page</CardTitle>
                        <CardDescription>Manage the content of the Privacy Policy page.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isPrivacyOpen && "rotate-180")} />
                            <span className="sr-only">{isPrivacyOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="privacyPage.title" render={({ field }) => (
                            <FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="privacyPage.content" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>Content (Markdown supported)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-xs gap-1.5">
                                                <Info className="h-3 w-3" />
                                                Formatting Help
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium leading-none">Markdown Tips</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Use markdown to format your text.
                                                    </p>
                                                </div>
                                                <div className="text-sm">
                                                    <p><code className="font-mono bg-muted p-1 rounded"># Heading 1</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">## Heading 2</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">**Bold Text**</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">*Italic Text*</code></p>
                                                    <p><code className="font-mono bg-muted p-1 rounded">- List Item</code></p>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormControl><Textarea {...field} value={field.value ?? ''} rows={20} /></FormControl>
                                <FormDescription>Use markdown for formatting (e.g., # Heading, * list item).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>

        <Collapsible open={isSocialOpen} onOpenChange={setIsSocialOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Social Links & Location</CardTitle>
                        <CardDescription>Manage social media links and the map location on the homepage.</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isSocialOpen && "rotate-180")} />
                            <span className="sr-only">{isSocialOpen ? 'Collapse' : 'Expand'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="socialLinks.facebook" render={({ field }) => (
                            <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://facebook.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="socialLinks.instagram" render={({ field }) => (
                            <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://instagram.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="socialLinks.youtube" render={({ field }) => (
                            <FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://youtube.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="socialLinks.linkedin" render={({ field }) => (
                            <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://linkedin.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="socialLinks.twitter" render={({ field }) => (
                            <FormItem><FormLabel>Twitter (X) URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://twitter.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="socialLinks.mapLocationUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Map Location URL</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://www.google.com/maps/embed?..." /></FormControl>
                                <FormDescription>Paste the "Embed a map" URL from Google Maps.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting || authLoading}>
          {form.formState.isSubmitting ? "Saving..." : "Save All Settings"}
        </Button>
      </form>
    </Form>
  );
}

    
