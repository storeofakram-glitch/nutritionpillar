
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, User, Package } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "./ui/button"
import type { Product, Coach } from "@/types"
import { getProducts } from "@/services/product-service"
import { getCoaches } from "@/services/coach-service"

export function SearchDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [allProducts, setAllProducts] = React.useState<Product[]>([])
  const [allCoaches, setAllCoaches] = React.useState<Coach[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const router = useRouter()

  React.useEffect(() => {
    async function fetchData() {
        const [fetchedProducts, fetchedCoaches] = await Promise.all([
            getProducts(),
            getCoaches(),
        ]);
        setAllProducts(fetchedProducts);
        setAllCoaches(fetchedCoaches);
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        setSearchTerm("");
    }
  }

  const handleSelect = (url: string) => {
    setOpen(false)
    setSearchTerm("")
    router.push(url)
  }

  const filteredProducts = searchTerm.length > 0
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
    
   const filteredCoaches = searchTerm.length > 0
    ? allCoaches.filter(coach =>
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      {children ? (
         <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <Button
            variant="ghost"
            size="icon"
            className="text-foreground/80"
            onClick={() => setOpen(true)}
        >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput 
            placeholder="Search products, categories, coaches..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
        />
        <CommandList>
           {!searchTerm ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                    <p>Search for supplements, product categories, coaches, or experts.</p>
                </div>
            ) : (
                <CommandEmpty>No results found.</CommandEmpty>
            )}
           {filteredProducts.length > 0 && (
            <CommandGroup heading="Products">
                {filteredProducts.map((product) => (
                <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => handleSelect(`/products/${product.id}`)}
                    className="cursor-pointer"
                >
                    <Package className="mr-2 h-4 w-4" />
                    <span>{product.name}</span>
                </CommandItem>
                ))}
            </CommandGroup>
           )}
           {filteredCoaches.length > 0 && (
            <CommandGroup heading="Coaches & Experts">
                {filteredCoaches.map((coach) => (
                <CommandItem
                    key={coach.id}
                    value={coach.name}
                    onSelect={() => handleSelect(`/coaches/${coach.id}`)}
                    className="cursor-pointer"
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>{coach.name}</span>
                </CommandItem>
                ))}
            </CommandGroup>
           )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
