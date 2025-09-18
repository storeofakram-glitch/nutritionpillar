
import { getProductById } from '@/services/product-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProductView from './_components/product-view';
import React from 'react';

// This is now a Server Component
export default async function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductView product={product} />;
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
