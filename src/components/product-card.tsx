
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.quantity === 0;

  const getStockBadge = () => {
    if (isOutOfStock) {
        return <Badge variant="destructive" className="mt-2 self-start">Out of Stock</Badge>;
    }
    if (product.quantity <= 10) {
        return <Badge variant="secondary" className="mt-2 self-start">{product.quantity} left</Badge>;
    }
    return <Badge variant="default" className="mt-2 self-start bg-green-600 hover:bg-green-700">In Stock</Badge>;
  }

  const imageUrl = (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : "https://picsum.photos/400/400?random=1";

  return (
    <Link href={`/products/${product.id}`} className="flex h-full">
        <Card className={cn(
            "flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full",
            product.sponsored && "border-primary/50 shadow-lg shadow-primary/10"
        )}>
        <CardHeader className="p-0 relative">
             {product.sponsored && (
                <Badge className="absolute top-2 left-2 z-10 bg-yellow-400 text-yellow-900 font-bold hover:bg-yellow-400">Sponsored</Badge>
            )}
            <div className="relative w-full aspect-square">
            <Image
                src={imageUrl}
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
            
            <div className="flex-grow" />

            <p className="text-2xl font-bold font-headline text-primary mt-auto">
            DZD {product.price.toFixed(2)}
            </p>
            {getStockBadge()}
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button className="w-full font-bold" disabled={isOutOfStock} asChild>
                <span>
                    {isOutOfStock ? "Out of Stock" : "View Details"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </span>
            </Button>
        </CardFooter>
        </Card>
    </Link>
  );
}
