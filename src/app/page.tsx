import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product-grid';
import { getProducts } from '@/services/product-service';

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-gray-900 text-white">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Athlete training"
          data-ai-hint="athlete training"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            Welcome to Nutrition Pillar
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Your one-stop shop for premium supplements. We provide quality ingredients for your peak performance and optimal health.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="font-bold">
              <Link href="#products">Shop Now</Link>
            </Button>
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
