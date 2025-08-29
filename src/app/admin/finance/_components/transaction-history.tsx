
"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order, Expense, Transaction } from "@/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import DeleteExpenseDialog from "./delete-expense-dialog"

interface TransactionHistoryProps {
    orders: Order[];
    expenses: Expense[];
    isLoading: boolean;
    onDataChange: () => void;
}

export default function TransactionHistory({ orders, expenses, isLoading, onDataChange }: TransactionHistoryProps) {
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const transactions: Transaction[] = useMemo(() => {
    const revenueTransactions: Transaction[] = orders
        .filter(order => order.status === 'delivered')
        .map(order => ({
            id: order.id,
            type: 'Revenue',
            description: `Order #${String(order.orderNumber).padStart(6, '0')} from ${order.customer.name}`,
            date: order.date,
            amount: order.amount
        }));

    const expenseTransactions: Transaction[] = expenses.map(expense => ({
        id: expense.id,
        type: 'Expense',
        description: expense.description,
        date: expense.date,
        amount: expense.amount
    }));

    return [...revenueTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [orders, expenses]);

  const handleDeleteClick = (transactionId: string) => {
    const expenseToDelete = expenses.find(exp => exp.id === transactionId);
    if (expenseToDelete) {
      setSelectedExpense(expenseToDelete);
      setIsDeleteDialogOpen(true);
    }
  }

  const handleDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedExpense(null);
    onDataChange();
  }
  
  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A log of all revenue (from delivered orders) and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
                      <TableCell>
                          <Badge variant={transaction.type === 'Revenue' ? 'default' : 'destructive'}>
                              {transaction.type}
                          </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'Revenue' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'Revenue' ? '+' : '-'}DZD {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.type === 'Expense' && (
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(transaction.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Delete Expense</span>
                           </Button>
                        )}
                      </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No transactions found.</p>
          )}
        </CardContent>
      </Card>

      {selectedExpense && (
        <DeleteExpenseDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          expense={selectedExpense}
          onDialogClose={handleDialogClose}
        />
      )}
    </>
  )
}
