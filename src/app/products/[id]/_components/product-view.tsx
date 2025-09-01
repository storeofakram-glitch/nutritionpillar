
"use client";

import { useEffect, useState }from 'react';
import type { Product } from '@/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from '@/components/ui/carousel';
import CountdownTimer from '@/components/countdown-timer';

export default function ProductView({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const { addToCart } = useCart();
  const router = useRouter();
  
  useEffect(() => {
    // Set default selections when component mounts
    if (product?.options?.sizes?.[0]) setSelectedSize(product.options.sizes[0]);
    if (product?.options?.flavors?.[0]) setSelectedFlavor(product.options.flavors[0]);
    if (product?.options?.colors?.[0]) setSelectedColor(product.options.colors[0]);
  }, [product]);


  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, { 
        size: selectedSize, 
        flavor: selectedFlavor, 
        color: selectedColor 
    });
    router.push('/cart');
  };

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

  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const originalPrice = product.price;
  const discountPrice = hasDiscount
    ? originalPrice - (originalPrice * (product.discountPercentage! / 100))
    : originalPrice;

  const showTimer = hasDiscount && product.discountEndDate && new Date(product.discountEndDate) > new Date();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="w-full relative">
            <Carousel>
                <CarouselContent>
                    {product.imageUrls.map((url, index) => (
                        <CarouselItem key={index}>
                            <div className="w-full aspect-square relative overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src={url}
                                    alt={`${product.name} image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
                <CarouselDots />
            </Carousel>
             {hasDiscount && (
                 <Badge 
                    variant="destructive"
                    className="absolute top-4 right-4 z-10 rounded-full h-16 w-16 flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: '#FF0000' }}
                >
                    -{product.discountPercentage}%
                </Badge>
            )}
        </div>
        
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mt-1">{product.name}</h1>
            <div className="mt-2">{getStockBadge()}</div>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold font-headline text-primary">
                DZD {discountPrice.toFixed(2)}
            </p>
            {hasDiscount && (
                <p className="text-2xl font-medium text-muted-foreground line-through">
                    DZD {originalPrice.toFixed(2)}
                </p>
            )}
          </div>
          
          {showTimer && (
            <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <CountdownTimer endDate={product.discountEndDate} />
            </div>
          )}

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
