
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
import { useState } from "react"
import { ExpenseForm } from "./expense-form"

interface AddExpenseDialogProps {
    onExpenseAdded: () => void;
}

export default function AddExpenseDialog({ onExpenseAdded }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)

  const handleFormSubmit = () => {
    onExpenseAdded();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of the expense below.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  )
}
