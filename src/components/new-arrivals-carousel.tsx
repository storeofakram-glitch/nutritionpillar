
'use client';

import { getProducts } from "@/services/product-service";
import type { Product } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const SmallProductCard = ({ product }: { product: Product }) => {
  const isOutOfStock = product.quantity === 0;
  const imageUrl = (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : "https://picsum.photos/400/400?random=1";

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <div className="text-center h-full flex flex-col p-2 rounded-lg border border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1 overflow-hidden">
        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
            <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
            />
            <Badge className="absolute top-2 left-2 z-10 rounded-full h-10 w-10 flex items-center justify-center text-xs font-bold">
                New
            </Badge>
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Badge variant="destructive">Out of Stock</Badge>
                </div>
            )}
        </div>
        <div className="flex flex-col flex-grow justify-end">
             <div className="bg-primary text-primary-foreground py-2 px-1 rounded-md mt-auto">
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default function NewArrivalsCarousel() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      const allProducts = await getProducts();
      // Assuming newer products are added to the end of the collection
      const arrivals = allProducts.slice(-8).reverse();
      setNewArrivals(arrivals);
      setLoading(false);
    }
    fetchNewArrivals();
  }, []);

  if (loading) {
    // Optional: add a loading skeleton here
    return null;
  }
  
  if (newArrivals.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
            <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">LATEST ADDED</p>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">New Arrivals</h2>
        </div>
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent>
                {newArrivals.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/4 lg:basis-1/6">
                        <div className="p-1 h-full">
                            <SmallProductCard product={product} />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
            <CarouselDots className="md:hidden" />
        </Carousel>
      </div>
    </section>
  );
}
