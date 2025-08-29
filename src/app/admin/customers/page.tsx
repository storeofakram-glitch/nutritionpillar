import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { orders } from "@/lib/mock-data"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const customers = orders.map(order => order.customer).reduce((acc, current) => {
    if (!acc.find(c => c.email === current.email)) {
        acc.push(current)
    }
    return acc
}, [] as {name: string, email: string}[])

export default function AdminCustomersPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>View and manage your customers.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map(customer => (
                            <TableRow key={customer.email}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>View Orders</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
