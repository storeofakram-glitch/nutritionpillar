
import { getProductById } from '@/services/product-service';
import { notFound } from 'next/navigation';
import ProductView from './_components/product-view';

// This is a Server Component
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductView product={product} />;
}
