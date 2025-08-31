
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
  const [products, setProducts] = React.useState<Product[]>([])
  const router = useRouter()

  React.useEffect(() => {
    async function fetchProducts() {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
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

  const handleSelect = (productId: string) => {
    setOpen(false)
    router.push(`/products/${productId}`)
  }

  return (
    <>
      <Button
        variant="ghost"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="hidden sm:inline-block">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a product name..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Products">
            {products.map((product) => (
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
        </CommandList>
      </CommandDialog>
    </>
  )
}
