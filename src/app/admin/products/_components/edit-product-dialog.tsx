
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import type { Product } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditProductDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    product: Product;
    onDialogClose: () => void;
}

export default function EditProductDialog({ isOpen, onOpenChange, product, onDialogClose }: EditProductDialogProps) {

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
        onDialogClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for "{product.name}".
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-6">
            <ProductForm product={product} onFormSubmit={onDialogClose} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
