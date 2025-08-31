

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product-grid';
import { getProducts } from '@/services/product-service';
import Marquee from '@/components/ui/marquee';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { getSiteSettings } from '@/services/site-settings-service';
import type { SiteSettings } from '@/types';

export default async function Home() {
  const products = await getProducts();
  const siteSettings: SiteSettings | null = await getSiteSettings();

  const hero = siteSettings?.hero || {
    images: [{ url: 'https://picsum.photos/1920/1080', alt: 'Athlete training' }],
    title: 'Welcome to Nutrition Pillar',
    description: 'Your one-stop shop for premium supplements. We provide quality ingredients for your peak performance and optimal health.',
    buttonText: 'Shop Now',
    buttonLink: '#products'
  };
  
  const marqueeMessages = siteSettings?.marquee?.messages || [
    { text: 'Free shipping on orders over 10,000 DZD' },
    { text: 'Check out our new arrivals!' },
    { text: 'Follow us on social media for updates' },
    { text: 'Quality you can trust' },
  ];

  const partnershipLogos = siteSettings?.partnershipLogos || [
    { src: 'https://picsum.photos/150/75?random=21', alt: 'Brand Logo 1', hint: 'brand logo' },
    { src: 'https://picsum.photos/150/75?random=22', alt: 'Brand Logo 2', hint: 'brand logo' },
    { src: 'https://picsum.photos/150/75?random=23', alt: 'Brand Logo 3', hint: 'brand logo' },
    { src: 'https://picsum.photos/150/75?random=24', alt: 'Brand Logo 4', hint: 'brand logo' },
    { src: 'https://picsum.photos/150/75?random=25', alt: 'Brand Logo 5', hint: 'brand logo' },
  ];
  
  const adBanner = siteSettings?.adBanner || {
    images: [{ url: 'https://picsum.photos/600/400?random=30', alt: 'Featured Promotion' }],
    title: 'Limited Time Offer!',
    description: "Get 20% off on all pre-workout supplements this week only. Don't miss out on this opportunity to fuel your workouts for less.",
    buttonText: 'Shop Pre-Workouts',
    buttonLink: '#products'
  };


  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-gray-900 text-white overflow-hidden">
        <Marquee vertical reverse className="h-full">
            {(hero.images || []).map((image, i) => (
                 <Image
                    key={i}
                    src={image.url}
                    alt={image.alt}
                    data-ai-hint="athlete training"
                    fill
                    className="object-cover h-full w-full"
                />
            ))}
        </Marquee>
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

      <section className="bg-muted border-y border-primary">
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
                <span className="font-semibold text-foreground whitespace-nowrap">{msg.text}</span>
            </div>
          ))}
        </Marquee>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-lg font-semibold text-muted-foreground uppercase tracking-wider mb-8">
            Partnership
          </h3>
          <div className="flex items-center gap-x-12 overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-center md:overflow-x-visible">
            {partnershipLogos.map((logo, index) => (
              <div key={index} className="relative h-12 w-32 flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  data-ai-hint={logo.hint}
                  fill
                  className="object-contain grayscale transition-all duration-300 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                    src={(adBanner.images[0] || { url: 'https://picsum.photos/600/400?random=30' }).url}
                    alt={(adBanner.images[0] || { alt: 'Promotional Banner' }).alt}
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

      <section id="products" className="py-12 md:py-20">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-10">Our Products</h2>
            <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
