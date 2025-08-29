
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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

  const getStockBadge = () => {
    if (isOutOfStock) {
        return <Badge variant="destructive" className="mt-2 self-start">Out of Stock</Badge>;
    }
    if (product.quantity <= 10) {
        return <Badge variant="secondary" className="mt-2 self-start">{product.quantity} left</Badge>;
    }
    return <Badge variant="default" className="mt-2 self-start bg-green-600 hover:bg-green-700">In Stock</Badge>;
  }

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
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <CardTitle className="text-lg font-headline leading-tight mt-1 mb-2 line-clamp-1">
                        {product.name}
                    </CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{product.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <p className="text-sm text-muted-foreground line-clamp-2 h-[40px] mb-2">{product.description}</p>
        
        <div className="flex-grow" />

        <p className="text-2xl font-bold font-headline text-primary mt-auto">
          DZD {product.price.toFixed(2)}
        </p>
         {getStockBadge()}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full font-bold" onClick={handleAddToCart} disabled={isOutOfStock}>
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
