
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

const SmallProductCard = ({ product }: { product: Product }) => {
  const isOutOfStock = product.quantity === 0;

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <div className="text-center h-full flex flex-col p-2 rounded-lg border border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1">
        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
            />
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Badge variant="destructive">Out of Stock</Badge>
                </div>
            )}
        </div>
        <div className="flex flex-col flex-grow">
            <h3 className="font-semibold text-sm truncate flex-grow">{product.name}</h3>
            <p className="font-bold text-primary mt-1">DZD {product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
};

export default async function NewArrivalsCarousel() {
  const allProducts = await getProducts();
  // Assuming newer products are added to the end of the collection
  const newArrivals = allProducts.slice(-8).reverse();

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
