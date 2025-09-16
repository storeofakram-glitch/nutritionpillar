import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSiteSettings } from '@/services/site-settings-service';
import type { SiteSettings } from '@/types';
import Image from 'next/image';

export default async function AboutPage() {
  const siteSettings: SiteSettings | null = await getSiteSettings();

  const about = siteSettings?.aboutPage || {
    title: "About Nutrition Pillar",
    subtitle: "Your trusted partner in achieving peak performance and optimal health through premium, scientifically-backed supplements.",
    imageUrl: "https://picsum.photos/600/600?random=10",
    imageAlt: "Our Team",
    storyTitle: "Our Story",
    storyContent1: "Founded by a team of fitness enthusiasts and nutritionists, Nutrition Pillar was born from a simple idea: to provide pure, potent, and transparent supplements that people can trust. We were tired of the hype and fillers in the industry. We wanted to create a brand that stands on a pillar of quality, efficacy, and unwavering support for our customers' goals.",
    storyContent2: "From our humble beginnings, we've grown into a community of athletes, health-conscious individuals, and everyone in between, all striving to be their best. We source the finest ingredients, rigorously test every batch, and provide clear, honest information so you can fuel your body with confidence.",
    missionTitle: "Our Mission",
    missionContent: "To empower your health and fitness journey with superior supplements, grounded in science and formulated for results.",
    visionTitle: "Our Vision",
    visionContent: "To be the most trusted name in sports nutrition, recognized for our commitment to quality, innovation, and customer success.",
    valuesTitle: "Our Values",
    valuesContent: "Quality, Transparency, and Community. These are the pillars that support everything we do.",
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{about.title}</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            {about.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg bg-black">
            {about.backgroundVideoUrl ? (
                 <video
                    src={about.backgroundVideoUrl}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    loading="lazy"
                >
                    Your browser does not support the video tag.
                </video>
            ) : about.videoUrl ? (
                <iframe
                    src={about.videoUrl}
                    title={about.storyTitle}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            ) : (
                 <Image 
                    src={about.imageUrl}
                    alt={about.imageAlt}
                    data-ai-hint="team photo"
                    fill
                    className="object-cover"
                />
            )}
        </div>
        <div>
            <h2 className="text-3xl font-bold font-headline mb-4">{about.storyTitle}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
                {about.storyContent1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
                {about.storyContent2}
            </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{about.missionTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {about.missionContent}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{about.visionTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {about.visionContent}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{about.valuesTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {about.valuesContent}
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
