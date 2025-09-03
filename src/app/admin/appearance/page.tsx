

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
import { PlusCircle, Trash2, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Schemas for form validation
const heroSettingsSchema = z.object({
    imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
    alt: z.string().min(1, { message: "Alt text is required." }),
    title: z.string().min(1, { message: "Title is required." }),
    description: z.string().min(1, { message: "Description is required." }),
    buttonText: z.string().min(1, { message: "Button text is required." }),
    buttonLink: z.string().min(1, { message: "Button link is required." }),
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
});

const adBannerSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
  imageAlt: z.string().min(1, { message: "Alt text is required." }),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  buttonText: z.string().min(1, { message: "Button text is required." }),
  buttonLink: z.string().min(1, { message: "Button link is required." }),
  counter1Value: z.coerce.number().optional(),
  counter1Label: z.string().optional(),
  counter2Value: z.coerce.number().optional(),
  counter2Label: z.string().optional(),
});


const aboutPageSettingsSchema = z.object({
    title: z.string().min(1, "Title is required."),
    subtitle: z.string().min(1, "Subtitle is required."),
    imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
    imageAlt: z.string().min(1, "Image alt text is required."),
    storyTitle: z.string().min(1, "Story title is required."),
    storyContent1: z.string().min(1, "Story content is required."),
    storyContent2: z.string().min(1, "Story content is required."),
    missionTitle: z.string().min(1, "Mission title is required."),
    missionContent: z.string().min(1, "Mission content is required."),
    visionTitle: z.string().min(1, "Vision title is required."),
    visionContent: z.string().min(1, "Vision content is required."),
    valuesTitle: z.string().min(1, "Values title is required."),
    valuesContent: z.string().min(1, "Values content is required."),
});


const siteSettingsSchema = z.object({
  hero: heroSettingsSchema,
  marquee: z.object({
    messages: z.array(marqueeMessageSchema)
  }),
  partnershipLogos: z.array(logoSchema),
  adBanner: adBannerSchema,
  aboutPage: aboutPageSettingsSchema,
});

const emptyValues: SiteSettings = {
    hero: { imageUrl: "", alt: "", title: "", description: "", buttonText: "", buttonLink: "" },
    marquee: { messages: [{ text: "", logoUrl: "", logoAlt: "" }] },
    partnershipLogos: [{ src: "", alt: "", hint: "" }],
    adBanner: { imageUrl: "", imageAlt: "", videoUrl: "", title: "", description: "", buttonText: "", buttonLink: "", counter1Value: 0, counter1Label: '', counter2Value: 0, counter2Label: '' },
    aboutPage: { title: "", subtitle: "", imageUrl: "", imageAlt: "", storyTitle: "", storyContent1: "", storyContent2: "", missionTitle: "", missionContent: "", visionTitle: "", visionContent: "", valuesTitle: "", valuesContent: "" },
};


export default function AdminAppearancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isHeroOpen, setIsHeroOpen] = useState(true);
  const [isMarqueeOpen, setIsMarqueeOpen] = useState(false);
  const [isLogosOpen, setIsLogosOpen] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
        const messages = settings.marquee?.messages?.map(m => ({ text: m.text, logoUrl: m.logoUrl || '', logoAlt: m.logoAlt || '' })) || [];
        const partnershipLogos = settings.partnershipLogos?.map(l => ({ ...l, src: l.src || '', alt: l.alt || '' })) || [];
        
        form.reset({
             hero: { ...emptyValues.hero, ...settings.hero },
             marquee: { messages: messages.length > 0 ? messages : emptyValues.marquee.messages }, 
             partnershipLogos: partnershipLogos.length > 0 ? partnershipLogos : emptyValues.partnershipLogos,
             adBanner: { ...emptyValues.adBanner, ...settings.adBanner },
             aboutPage: { ...emptyValues.aboutPage, ...settings.aboutPage },
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
                        <FormField control={form.control} name="hero.imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl><Input {...field} placeholder="https://picsum.photos/1920/1080" /></FormControl>
                                <FormDescription>Recommended aspect ratio: 16:9 (e.g., 1920x1080 pixels).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.alt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image Alt Text</FormLabel>
                                <FormControl><Input {...field} placeholder="Hero banner image" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl><Input {...field} placeholder="Welcome to..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hero.description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} placeholder="Your one-stop shop for..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="hero.buttonText" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button Text</FormLabel>
                                    <FormControl><Input {...field} placeholder="Shop Now" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="hero.buttonLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Button Link</FormLabel>
                                    <FormControl><Input {...field} placeholder="/#products" /></FormControl>
                                    <FormMessage />
                                </FormItem>
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
                                        <FormControl><Input {...field} placeholder={`Message ${index + 1}`} /></FormControl>
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
                                        <FormControl><Input {...field} placeholder="https://..." /></FormControl>
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
                                        <FormControl><Input {...field} placeholder="Logo description" /></FormControl>
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
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`partnershipLogos.${index}.src`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo Image URL</FormLabel>
                                <FormControl><Input {...field} placeholder="https://..." /></FormControl>
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
                                <FormControl><Input {...field} placeholder="Brand Name" /></FormControl>
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
                <Button type="button" variant="outline" size="sm" onClick={() => appendLogo({ src: "", alt: "", hint: "brand logo" })}>
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
                         <FormField control={form.control} name="adBanner.videoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL (Optional)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://www.youtube.com/embed/..." /></FormControl>
                                <FormDescription>If provided, this video will replace the image. Use the embed URL from YouTube or Vimeo.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="adBanner.imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl><Input {...field} placeholder="https://picsum.photos/1200/600" /></FormControl>
                                <FormDescription>Recommended size: 1200x600 pixels. This is a fallback if no video URL is provided.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="adBanner.imageAlt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image Alt Text</FormLabel>
                                <FormControl><Input {...field} placeholder="Promotional banner image" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="adBanner.title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Limited Time Offer!" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="adBanner.description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Get 20% off..." /></FormControl><FormMessage /></FormItem>
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
                                <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} placeholder="Shop Now" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="adBanner.buttonLink" render={({ field }) => (
                                <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input {...field} placeholder="/#products" /></FormControl><FormMessage /></FormItem>
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
                         <FormField control={form.control} name="aboutPage.title" render={({ field }) => (
                            <FormItem><FormLabel>Main Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="aboutPage.subtitle" render={({ field }) => (
                            <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Recommended aspect ratio: 1:1 (e.g., 600x600).</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.imageAlt" render={({ field }) => (
                            <FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.storyTitle" render={({ field }) => (
                            <FormItem><FormLabel>Story Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.storyContent1" render={({ field }) => (
                            <FormItem><FormLabel>Story Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aboutPage.storyContent2" render={({ field }) => (
                            <FormItem><FormLabel>Story Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormField control={form.control} name="aboutPage.missionTitle" render={({ field }) => (
                                <FormItem><FormLabel>Mission Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.missionContent" render={({ field }) => (
                                <FormItem><FormLabel>Mission Content</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormField control={form.control} name="aboutPage.visionTitle" render={({ field }) => (
                                <FormItem><FormLabel>Vision Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.visionContent" render={({ field }) => (
                                <FormItem><FormLabel>Vision Content</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormField control={form.control} name="aboutPage.valuesTitle" render={({ field }) => (
                                <FormItem><FormLabel>Values Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="aboutPage.valuesContent" render={({ field }) => (
                                <FormItem><FormLabel>Values Content</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save All Settings"}
        </Button>
      </form>
    </Form>
  );
}
