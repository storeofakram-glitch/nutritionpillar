
// This is a new file for the Appearance management page in the admin dashboard.
"use client";

import { useEffect, useState } from "react";
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
import { PlusCircle, Trash2 } from "lucide-react";

// Schemas for form validation
const logoSchema = z.object({
  src: z.string().url({ message: "Please enter a valid URL." }),
  alt: z.string().min(1, { message: "Alt text is required." }),
  hint: z.string().optional(),
});

const adBannerSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid URL." }),
  alt: z.string().min(1, { message: "Alt text is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  buttonText: z.string().min(1, { message: "Button text is required." }),
  buttonLink: z.string().min(1, { message: "Button link is required." }),
});

const siteSettingsSchema = z.object({
  marquee: z.object({
    messages: z.array(z.object({ text: z.string().min(1, "Message cannot be empty.") }))
  }),
  partnershipLogos: z.array(logoSchema),
  adBanner: adBannerSchema,
});

export default function AdminAppearancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof siteSettingsSchema>>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      marquee: { messages: [{ text: "" }] },
      partnershipLogos: [{ src: "", alt: "", hint: "" }],
      adBanner: { imageUrl: "", alt: "", title: "", description: "", buttonText: "", buttonLink: "" },
    },
  });

  const { fields: marqueeFields, append: appendMarquee, remove: removeMarquee } = useFieldArray({
    control: form.control,
    name: "marquee.messages",
  });

  const { fields: logoFields, append: appendLogo, remove: removeLogo } = useFieldArray({
    control: form.control,
    name: "partnershipLogos",
  });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const settings = await getSiteSettings();
      if (settings) {
        form.reset(settings);
      }
      setLoading(false);
    }
    loadSettings();
  }, [form]);

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
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Marquee Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Marquee Settings</CardTitle>
            <CardDescription>Manage the scrolling text messages at the top of the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marqueeFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`marquee.messages.${index}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input {...field} placeholder={`Message ${index + 1}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMarquee(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMarquee({ text: "" })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Message
            </Button>
          </CardContent>
        </Card>

        {/* Partnership Logos */}
        <Card>
          <CardHeader>
            <CardTitle>Partnership Logos</CardTitle>
            <CardDescription>Manage the logos displayed in the partnership section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {logoFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => removeLogo(index)}>
                    Remove
                </Button>
              </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={() => appendLogo({ src: "", alt: "", hint: "brand logo" })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Logo
            </Button>
          </CardContent>
        </Card>
        
        {/* Ad Banner */}
        <Card>
            <CardHeader>
                <CardTitle>Ad Banner</CardTitle>
                <CardDescription>Manage the main promotional ad banner on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="adBanner.imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input {...field} placeholder="https://picsum.photos/600/400" /></FormControl>
                            <FormDescription>Recommended aspect ratio: 16:9 (e.g., 1200x675 pixels).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="adBanner.alt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image Alt Text</FormLabel>
                            <FormControl><Input {...field} placeholder="Promotional banner" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="adBanner.title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} placeholder="Limited Time Offer!" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="adBanner.description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea {...field} placeholder="Get 20% off..." /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="adBanner.buttonText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Button Text</FormLabel>
                                <FormControl><Input {...field} placeholder="Shop Now" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="adBanner.buttonLink"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Button Link</FormLabel>
                                <FormControl><Input {...field} placeholder="/#products" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save All Settings"}
        </Button>
      </form>
    </Form>
  );
}
