
"use client";

import { useEffect, useState } from 'react';
import { getProductById } from '@/services/product-service';
import type { Product } from '@/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const { addToCart } = useCart();
  const router = useRouter();
  const { id: productId } = useParams();

  useEffect(() => {
    async function fetchProduct() {
        if (!productId) return;
        const fetchedProduct = await getProductById(productId as string);
        if (!fetchedProduct) {
            notFound();
        }
        setProduct(fetchedProduct);
        // Set default selections
        if (fetchedProduct?.options?.sizes?.[0]) setSelectedSize(fetchedProduct.options.sizes[0]);
        if (fetchedProduct?.options?.flavors?.[0]) setSelectedFlavor(fetchedProduct.options.flavors[0]);
        if (fetchedProduct?.options?.colors?.[0]) setSelectedColor(fetchedProduct.options.colors[0]);
        setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, { 
        size: selectedSize, 
        flavor: selectedFlavor, 
        color: selectedColor 
    });
    router.push('/cart');
  };
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="space-y-6">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const isOutOfStock = product.quantity === 0;

  const getStockBadge = () => {
    if (isOutOfStock) {
        return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.quantity <= 10) {
        return <Badge variant="secondary">{product.quantity} left in stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600 hover:bg-green-700">In Stock</Badge>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="w-full aspect-square relative overflow-hidden rounded-lg shadow-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mt-1">{product.name}</h1>
            <div className="mt-2">{getStockBadge()}</div>
          </div>

          <p className="text-4xl font-bold font-headline text-primary">
            DZD {product.price.toFixed(2)}
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <Separator />
          
          <div className="grid gap-6">
            {product.options?.sizes && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                  {product.options.sizes.map(size => (
                    <div key={size}>
                        <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                        <Label htmlFor={`size-${size}`} className="px-4 py-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                            {size}
                        </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {product.options?.flavors && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Flavor</Label>
                 <RadioGroup value={selectedFlavor} onValueChange={setSelectedFlavor} className="flex flex-wrap gap-2">
                  {product.options.flavors.map(flavor => (
                    <div key={flavor}>
                        <RadioGroupItem value={flavor} id={`flavor-${flavor}`} className="sr-only" />
                        <Label htmlFor={`flavor-${flavor}`} className="px-4 py-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                            {flavor}
                        </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {product.options?.colors && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                  {product.options.colors.map(color => (
                     <div key={color}>
                        <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                        <Label htmlFor={`color-${color}`} className="px-4 py-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                            {color}
                        </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Label htmlFor="quantity" className="text-base font-semibold">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 h-10"
                disabled={isOutOfStock}
              />
            </div>
          </div>
          
          <Button size="lg" onClick={handleAddToCart} disabled={isOutOfStock || quantity > product.quantity} className="w-full font-bold text-lg py-6">
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add a custom not found component if needed
export function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold">404 - Product Not Found</h1>
      <p className="mt-4">Sorry, we couldn't find the product you're looking for.</p>
      <Button asChild className="mt-8">
        <a href="/">Go back to shopping</a>
      </Button>
    </div>
  )
}
