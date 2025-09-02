
'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/types';
import ProductCard from './product-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Separator } from './ui/separator';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    size: 'all',
    color: 'all',
    flavor: 'all',
  });

  const handleFilterChange = (filterName: keyof typeof filters) => (value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const availableFilters = useMemo(() => {
    const categories = new Set<string>();
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const flavors = new Set<string>();
    products.forEach(p => {
      categories.add(p.category);
      p.options?.sizes?.forEach(s => sizes.add(s));
      p.options?.colors?.forEach(c => colors.add(c));
      p.options?.flavors?.forEach(f => flavors.add(f));
    });
    return {
      categories: Array.from(categories),
      sizes: Array.from(sizes),
      colors: Array.from(colors),
      flavors: Array.from(flavors),
    };
  }, [products]);
  
  const { sponsoredProducts, regularProducts } = useMemo(() => {
    const filtered = products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filters.category === 'all' || product.category === filters.category;
      const sizeMatch = filters.size === 'all' || product.options?.sizes?.includes(filters.size);
      const colorMatch = filters.color === 'all' || product.options?.colors?.includes(filters.color);
      const flavorMatch = filters.flavor === 'all' || product.options?.flavors?.includes(filters.flavor);
      return searchMatch && categoryMatch && sizeMatch && colorMatch && flavorMatch;
    });

    const sponsored = filtered.filter(p => p.sponsored);
    
    // "regular" list now contains ALL filtered products.
    return {
        sponsoredProducts: sponsored,
        regularProducts: filtered,
    }
  }, [products, searchTerm, filters]);

  const hasSponsoredProducts = sponsoredProducts.length > 0;
  const hasRegularProducts = regularProducts.length > 0;

  // We only want to show the "All Products" heading if there are sponsored products to differentiate from.
  const showAllProductsHeading = hasSponsoredProducts && regularProducts.filter(p => !p.sponsored).length > 0;

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
        <div className="relative md:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        
        <Select value={filters.category} onValueChange={handleFilterChange('category')}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {availableFilters.categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {hasSponsoredProducts && (
        <div className="mb-12">
            <h3 className="text-2xl font-bold font-headline mb-6">Sponsored Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {sponsoredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
        </div>
      )}

      {hasSponsoredProducts && hasRegularProducts && <Separator className="my-12" />}

      {hasRegularProducts ? (
        <div>
            {showAllProductsHeading && (
                 <h3 className="text-2xl font-bold font-headline mb-6">All Products</h3>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {regularProducts.filter(p => !p.sponsored).map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        </div>
      ) : !hasSponsoredProducts ? (
        <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
        </div>
      ) : null}
    </div>
  );
}
