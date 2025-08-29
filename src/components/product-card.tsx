'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    // For simplicity, we add the first available option if it exists.
    // A real app would let the user select options on the card or a product page.
    const defaultOptions = {
      size: product.options?.sizes?.[0],
      flavor: product.options?.flavors?.[0],
      color: product.options?.colors?.[0],
    };
    addToCart(product, 1, defaultOptions);
    router.push('/cart');
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className="relative w-full aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={cn("object-cover", isOutOfStock && "grayscale")}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {product.quantity <= 10 && (
           <Badge 
            variant={isOutOfStock ? "destructive" : "secondary"}
            className="absolute top-2 right-2"
          >
            {isOutOfStock ? "Out of Stock" : `${product.quantity} left`}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <CardTitle className="text-lg font-headline leading-tight mt-1 mb-2 flex-grow">
          {product.name}
        </CardTitle>
        <p className="text-2xl font-bold font-headline text-primary">
          DZD {product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full font-bold" onClick={handleAddToCart} disabled={isOutOfStock}>
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
