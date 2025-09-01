
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "./ui/button"
import type { Product } from "@/types"
import { getProducts } from "@/services/product-service"

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const [allProducts, setAllProducts] = React.useState<Product[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const router = useRouter()

  React.useEffect(() => {
    async function fetchProducts() {
      const fetchedProducts = await getProducts();
      setAllProducts(fetchedProducts);
    }
    fetchProducts();
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

  const handleSelect = (productId: string) => {
    setOpen(false)
    setSearchTerm("")
    router.push(`/products/${productId}`)
  }

  const filteredProducts = searchTerm.length > 0
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-foreground/80"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput 
            placeholder="Type a product name..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
           {searchTerm.length > 0 && filteredProducts.length > 0 && (
            <CommandGroup heading="Products">
                {filteredProducts.map((product) => (
                <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => handleSelect(product.id)}
                    className="cursor-pointer"
                >
                    <span>{product.name}</span>
                </CommandItem>
                ))}
            </CommandGroup>
           )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
