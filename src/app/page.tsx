

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product-grid';
import { getProducts } from '@/services/product-service';
import Marquee from '@/components/ui/marquee';
import { ArrowRight } from 'lucide-react';
import { getSiteSettings } from '@/services/site-settings-service';
import type { SiteSettings, Product } from '@/types';
import NewArrivalsCarousel from '@/components/new-arrivals-carousel';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import DynamicCounter from '@/components/dynamic-counter';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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


  const hero = siteSettings?.hero || {
    imageUrl: 'https://github.com/akramFit/Nutrition-Pillar-Assets/blob/main/hero%20image%20(np%20store).png?raw=true', 
    alt: 'Nutrition Pillar',
    title: 'Welcome to Nutritionn Pillar ',
    description: '\nYour one-stop shop for premium supplements. We provide quality ingredients for your peak performance and optimal health.',
    buttonText: 'Shop Now',
    buttonLink: '/#products'
  };
  
  const marqueeMessages = siteSettings?.marquee?.messages || [
    { text: 'akram fit training', logoUrl: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', logoAlt: 'akram fit' },
  ];

  const partnershipLogos = siteSettings?.partnershipLogos || [
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: '' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
    { src: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/p.png?raw=true', alt: 'Akram Fit Training', hint: 'brand logo' },
  ];
  
  const adBanner = siteSettings?.adBanner || {
    imageUrl: 'https://github.com/akramFit/Akram-Fit-Training-Assets/blob/main/5.png?raw=true',
    imageAlt: 'Promotional banner',
    title: 'the must popular transformation',
    description: "to get a transformation like this just apply ",
    buttonText: 'apply',
    buttonLink: 'www.akramfit.com'
  };


  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-white overflow-hidden">
        <Image
            src={hero.imageUrl}
            alt={hero.alt || "Hero image"}
            data-ai-hint="athlete training"
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center p-4 bg-black/60">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            {hero.title}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            {hero.description}
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="font-bold">
              <Link href={hero.buttonLink}>{hero.buttonText}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary border-y border-primary/50">
        <Marquee>
          {marqueeMessages.map((msg, i) => (
            <div key={i} className="flex items-center gap-6 mx-8">
                {msg.logoUrl && (
                    <Image 
                        src={msg.logoUrl}
                        alt={msg.logoAlt || 'Marquee Logo'}
                        width={24}
                        height={24}
                        className="object-contain"
                    />
                )}
                <span className="font-semibold text-primary-foreground whitespace-nowrap">{msg.text}</span>
            </div>
          ))}
        </Marquee>
      </section>

      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg shadow-primary/20">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                    src={adBanner.imageUrl}
                    alt={adBanner.imageAlt || "Promotional banner"}
                    data-ai-hint="promotional banner"
                    fill
                    className="object-cover"
                />
            </div>
            <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                    {adBanner.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                    {adBanner.description}
                </p>

                {(adBanner.counter1Value || adBanner.counter2Value) && (
                  <div className="flex justify-center md:justify-start gap-8 mb-6">
                    {adBanner.counter1Value && adBanner.counter1Label && (
                      <div className="text-center">
                        <DynamicCounter endValue={adBanner.counter1Value} suffix="+" className="text-3xl font-bold text-primary" />
                        <p className="text-sm text-muted-foreground">{adBanner.counter1Label}</p>
                      </div>
                    )}
                    {adBanner.counter2Value && adBanner.counter2Label && (
                      <div className="text-center">
                        <DynamicCounter endValue={adBanner.counter2Value} suffix="+" className="text-3xl font-bold text-primary" />
                        <p className="text-sm text-muted-foreground">{adBanner.counter2Label}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button asChild size="lg" className="font-bold">
                    <Link href={adBanner.buttonLink}>
                        {adBanner.buttonText}
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
                    <div className="relative h-16">
                      <Image
                        src={logo.src}
                        alt={logo.alt || `Partnership logo ${index + 1}`}
                        data-ai-hint={logo.hint}
                        fill
                        className="object-contain grayscale transition-all duration-300 hover:grayscale-0"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}
