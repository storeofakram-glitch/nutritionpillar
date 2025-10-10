
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product-grid';
import { getProducts } from '@/services/product-service';
import Marquee from '@/components/ui/marquee';
import { ArrowRight, BrainCircuit, ShoppingBag, Users as UsersIcon } from 'lucide-react';
import { getSiteSettings } from '@/services/site-settings-service';
import type { SiteSettings, Product, PartnershipLogo } from '@/types';
import NewArrivalsCarousel from '@/components/new-arrivals-carousel';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import DynamicCounter from '@/components/dynamic-counter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import CoachesExpertsSection from '@/components/coaches-experts-section';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/contexts/language-context';


const LogoItem = ({ logo }: { logo: PartnershipLogo }) => {
    const content = (
        <div className="relative h-16">
            <Image
                src={logo.src}
                alt={logo.alt || `Partnership logo`}
                data-ai-hint={logo.hint}
                fill
                className="object-contain transition-all duration-300 md:grayscale md:hover:grayscale-0"
                sizes="(max-width: 768px) 33vw, 20vw"
            />
        </div>
    );

    if (logo.url) {
        return (
            <Link href={logo.url} target="_blank" rel="noopener noreferrer" aria-label={logo.alt}>
                {content}
            </Link>
        );
    }

    return content;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isAdVideoLoaded, setIsAdVideoLoaded] = useState(false);
  const { language } = useLanguage();
  const [isService1Expanded, setIsService1Expanded] = useState(false);
  const [isService2Expanded, setIsService2Expanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [productsData, settingsData] = await Promise.all([
        getProducts(),
        getSiteSettings(),
      ]);
      setProducts(productsData);
      setSiteSettings(settingsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Skeleton className="h-[70vh] w-full" />
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!siteSettings) {
      return (
          <div className="flex items-center justify-center h-screen">
              <p>Site under maintenance. Please check back soon.</p>
          </div>
      )
  }

  const { hero, coreServices, marquee, adBanner, partnershipLogos, socialLinks } = siteSettings;
  const isAdBannerLinkExternal = adBanner.buttonLink?.startsWith('http://') || adBanner.buttonLink?.startsWith('https://');
  const mapUrl = socialLinks?.mapLocationUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.405783303357!2d3.05896!3d36.71277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fafb4a22c5e5b%3A0x4c2c5f6cac23b8a1!2sAlgiers!5e0!3m2!1sen!2sdz!4v1620056238383!5m2!1sen!2sdz";

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-white overflow-hidden">
        <Image
            src={hero.imageUrl}
            alt={hero.alt || "Hero image"}
            data-ai-hint="athlete training"
            fill
            sizes="100vw"
            className="object-cover"
            priority
        />
        {hero.videoUrl && (
            <video
                src={hero.videoUrl}
                className={cn(
                  "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000",
                  isVideoLoaded ? "opacity-100" : "opacity-0"
                )}
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={() => setIsVideoLoaded(true)}
            >
                Your browser does not support the video tag.
            </video>
        )}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center p-4 bg-black/60">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            {hero.title}
          </h1>
          <div className="text-lg md:text-xl max-w-2xl mb-8 prose dark:prose-invert prose-p:text-white">
            <ReactMarkdown>{hero.description[language]}</ReactMarkdown>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="font-bold bg-primary/70 text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Link href={hero.buttonLink}>{hero.buttonText[language]}</Link>
            </Button>
            {hero.button2Text?.[language] && hero.button2Link && (
                <Button asChild size="lg" className="font-bold bg-primary/70 text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <Link href={hero.button2Link}>{hero.button2Text[language]}</Link>
                </Button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary border-y border-border min-h-[40px] flex items-center">
        <Marquee>
          {marquee.messages.map((msg, i) => (
            <div key={i} className="flex items-center gap-4 mx-6">
                {msg.logoUrl && (
                    <Image
                        src={msg.logoUrl}
                        alt={msg.logoAlt || 'logo'}
                        width={34}
                        height={34}
                        className="object-contain"
                        style={{ height: '34px', width: 'auto' }}
                    />
                )}
                <span className="font-semibold text-secondary-foreground whitespace-nowrap">{msg.text}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {coreServices && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">{coreServices.subheading[language]}</p>
                <h2 className="inline-block gradient-border text-foreground font-bold font-headline text-3xl md:text-4xl px-6 py-2 rounded-md mt-2">{coreServices.heading[language]}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <Card className="flex flex-col items-center text-center p-4 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 gradient-border">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                    <ShoppingBag className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl md:text-2xl">{coreServices.services[0].title[language]}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className={cn("text-muted-foreground text-sm md:text-base", !isService1Expanded && "line-clamp-5 md:line-clamp-none")}>
                    {coreServices.services[0].description[language]}
                  </p>
                  <Button variant="link" className="text-primary p-0 h-auto md:hidden" onClick={() => setIsService1Expanded(!isService1Expanded)}>
                      {isService1Expanded ? 'Show Less' : 'Show More'}
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href={coreServices.services[0].buttonLink}>{coreServices.services[0].buttonText[language]}</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col items-center text-center p-4 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 gradient-border">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                    <UsersIcon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl md:text-2xl">{coreServices.services[1].title[language]}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className={cn("text-muted-foreground text-sm md:text-base", !isService2Expanded && "line-clamp-5 md:line-clamp-none")}>
                    {coreServices.services[1].description[language]}
                  </p>
                  <Button variant="link" className="text-primary p-0 h-auto md:hidden" onClick={() => setIsService2Expanded(!isService2Expanded)}>
                      {isService2Expanded ? 'Show Less' : 'Show More'}
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href={coreServices.services[1].buttonLink}>{coreServices.services[1].buttonText[language]}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      )}

      <CoachesExpertsSection />

      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg shadow-primary/20">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                {adBanner.backgroundVideoUrl ? (
                    <>
                        <Image
                            src={adBanner.imageUrl}
                            alt={adBanner.imageAlt || "Promotional banner"}
                            data-ai-hint="promotional banner"
                            fill
                            className={cn(
                                "object-cover transition-opacity duration-1000",
                                isAdVideoLoaded ? "opacity-0" : "opacity-100"
                            )}
                        />
                        <video
                            src={adBanner.backgroundVideoUrl}
                            className={cn(
                                "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000",
                                isAdVideoLoaded ? "opacity-100" : "opacity-0"
                            )}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onCanPlay={() => setIsAdVideoLoaded(true)}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </>
                ) : adBanner.videoUrl ? (
                    <iframe
                        src={adBanner.videoUrl}
                        title={adBanner.title[language]}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                ) : (
                    <Image
                        src={adBanner.imageUrl}
                        alt={adBanner.imageAlt || "Promotional banner"}
                        data-ai-hint="promotional banner"
                        fill
                        className="object-cover"
                    />
                )}
            </div>
            <div className="text-center md:text-left">
                <h2 className={cn(
                    "text-3xl md:text-4xl font-bold font-headline mb-4",
                    adBanner.flashTitle && 'animate-flash'
                )}>
                    {adBanner.title[language]}
                </h2>
                <p className="text-muted-foreground mb-6">
                    {adBanner.description[language]}
                </p>

                <div className="flex justify-center md:justify-start gap-4 mb-6">
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <DynamicCounter endValue={adBanner.counter1Value || 0} suffix="+" className="text-2xl font-bold text-primary" />
                        <p className="text-xs text-muted-foreground mt-1">{adBanner.counter1Label?.[language] || ''}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <DynamicCounter endValue={adBanner.counter2Value || 0} suffix="+" className="text-2xl font-bold text-primary" />
                        <p className="text-xs text-muted-foreground mt-1">{adBanner.counter2Label?.[language] || ''}</p>
                    </div>
                </div>

                <Button asChild size="lg" className="font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <Link 
                        href={adBanner.buttonLink}
                        target={isAdBannerLinkExternal ? '_blank' : '_self'}
                        rel={isAdBannerLinkExternal ? 'noopener noreferrer' : ''}
                    >
                        {adBanner.buttonText[language]}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      <NewArrivalsCarousel />

      <section id="products" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-10">Our Products</h2>
            <ProductGrid products={products} />
        </div>
      </section>
      
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-card p-8 rounded-lg shadow-lg shadow-primary/20">
            <h3 className="text-center text-lg font-semibold text-card-foreground uppercase tracking-wider mb-8">
              Partnership
            </h3>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {partnershipLogos.map((logo, index) => (
                  <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <LogoItem logo={logo} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselDots />
            </Carousel>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-10">Find Us</h2>
            <div className="max-w-4xl mx-auto">
                <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg border shadow-primary/20">
                    <iframe 
                        src={mapUrl}
                        width="100%" 
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Our Location"
                    ></iframe>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
