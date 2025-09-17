
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ProductForm } from "./product-form"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddProductDialogProps {
  onProductAdded: () => void;
}

export default function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false)

  // This function will be called by the form on successful submission
  const handleFormSubmit = () => {
    onProductAdded(); // Trigger the refresh in the parent page
    setOpen(false);   // Close the dialog
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your store.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-6">
          <ProductForm onFormSubmit={handleFormSubmit} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
