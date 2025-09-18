'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSiteSettings } from '@/services/site-settings-service';
import type { SiteSettings, TranslatedText } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Skeleton } from '@/components/ui/skeleton';

const defaultAbout = {
    title: { en: "About Nutrition Pillar", ar: "حول نيوتريشن بيلر" },
    subtitle: { en: "Your trusted partner in achieving peak performance and optimal health through premium, scientifically-backed supplements.", ar: "شريكك الموثوق في تحقيق أعلى مستويات الأداء والصحة المثلى من خلال مكملات غذائية ممتازة ومدعومة علميًا." },
    imageUrl: "https://picsum.photos/600/600?random=10",
    imageAlt: "Our Team",
    videoUrl: "",
    backgroundVideoUrl: "",
    storyTitle: { en: "Our Story", ar: "قصتنا" },
    storyContent1: { en: "Founded by a team of fitness enthusiasts and nutritionists, Nutrition Pillar was born from a simple idea: to provide pure, potent, and transparent supplements that people can trust. We were tired of the hype and fillers in the industry. We wanted to create a brand that stands on a pillar of quality, efficacy, and unwavering support for our customers' goals.", ar: "تأسست نيوتريشن بيلر على يد فريق من عشاق اللياقة البدنية وخبراء التغذية، وقد ولدت من فكرة بسيطة: توفير مكملات غذائية نقية وفعالة وشفافة يمكن للناس الوثوق بها. لقد سئمنا من الضجيج والمكونات غير الضرورية في الصناعة. أردنا إنشاء علامة تجارية تقوم على ركيزة من الجودة والفعالية والدعم الثابت لأهداف عملائنا." },
    storyContent2: { en: "From our humble beginnings, we've grown into a community of athletes, health-conscious individuals, and everyone in between, all striving to be their best. We source the finest ingredients, rigorously test every batch, and provide clear, honest information so you can fuel your body with confidence.", ar: "من بداياتنا المتواضعة، نمونا لنصبح مجتمعًا من الرياضيين والأفراد المهتمين بالصحة وكل من بينهم، وجميعهم يسعون ليكونوا في أفضل حالاتهم. نحن نستورد أجود المكونات، ونختبر كل دفعة بدقة، ونقدم معلومات واضحة وصادقة حتى تتمكن من تغذية جسمك بثقة." },
    missionTitle: { en: "Our Mission", ar: "مهمتنا" },
    missionContent: { en: "To empower your health and fitness journey with superior supplements, grounded in science and formulated for results.", ar: "تمكين رحلتك الصحية واللياقة البدنية بمكملات غذائية فائقة، قائمة على العلم ومصممة لتحقيق النتائج." },
    visionTitle: { en: "Our Vision", ar: "رؤيتنا" },
    visionContent: { en: "To be the most trusted name in sports nutrition, recognized for our commitment to quality, innovation, and customer success.", ar: "أن نكون الاسم الأكثر ثقة في مجال التغذية الرياضية، معترفًا به لالتزامنا بالجودة والابتكار ونجاح العملاء." },
    valuesTitle: { en: "Our Values", ar: "قيمنا" },
    valuesContent: { en: "Quality, Transparency, and Community. These are the pillars that support everything we do.", ar: "الجودة والشفافية والمجتمع. هذه هي الركائز التي تدعم كل ما نقوم به." },
  };

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const fetchedSettings = await getSiteSettings();
      setSettings(fetchedSettings);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const about = settings?.aboutPage || defaultAbout;
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-12">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full max-w-3xl mx-auto mt-4" />
            </div>
             <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{about.title[language]}</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            {about.subtitle[language]}
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
                    title={about.storyTitle[language]}
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
            <h2 className="text-3xl font-bold font-headline mb-4">{about.storyTitle[language]}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
                {about.storyContent1[language]}
            </p>
            <p className="text-muted-foreground leading-relaxed">
                {about.storyContent2[language]}
            </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{about.missionTitle[language]}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {about.missionContent[language]}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{about.visionTitle[language]}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {about.visionContent[language]}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{about.valuesTitle[language]}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {about.valuesContent[language]}
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
