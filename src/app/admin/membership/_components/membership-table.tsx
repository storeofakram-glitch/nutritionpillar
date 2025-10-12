
"use client"

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Membership, Customer, Order } from "@/types";
import EditMembershipDialog from "./edit-membership-dialog";
import DeleteMembershipDialog from "./delete-membership-dialog";
import ViewCustomerDialog from "../../customers/_components/view-customer-dialog";
import { getCustomerOrders } from "@/services/admin-service";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MembershipTableProps {
  memberships: Membership[];
  isLoading: boolean;
  onDataChange: () => void;
}

export default function MembershipTable({ memberships, isLoading, onDataChange }: MembershipTableProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewCustomerDialogOpen, setIsViewCustomerDialogOpen] = useState(false);
  
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);


  const handleEdit = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewCustomer = async (membership: Membership) => {
      if (!membership.customerEmail) {
          toast({ variant: 'destructive', title: 'Error', description: 'Customer email is not available for this member.' });
          return;
      }
      const customer: Customer = {
          name: membership.customerName,
          email: membership.customerEmail,
      };
      
      const orders = await getCustomerOrders(customer.email);

      // Add phone number to the customer object for the dialog
      if (membership.customerPhone) {
          (customer as any).phone = membership.customerPhone;
      }

      setSelectedCustomer(customer);
      setCustomerOrders(orders);
      setIsViewCustomerDialogOpen(true);
  }

  const onDialogClose = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewCustomerDialogOpen(false);
    setSelectedMembership(null);
    setSelectedCustomer(null);
    setCustomerOrders([]);
    onDataChange();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Membership code copied to clipboard." });
  }

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <ScrollArea className="h-[460px]">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Identifier / Plan</TableHead>
                <TableHead>Membership Code</TableHead>
                <TableHead>Recommendations</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : memberships.map(membership => (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">{membership.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                      {membership.type === 'Fitness Pillar' ? membership.customerPhone : (membership.customerEmail || membership.coachingPlan)}
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Badge variant="outline">{membership.code}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(membership.code)}>
                              <Copy className="h-3.5 w-3.5" />
                          </Button>
                      </div>
                  </TableCell>
                  <TableCell>{membership.recommendedProducts?.length || 0}</TableCell>
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
                        <DropdownMenuItem onSelect={() => handleEdit(membership)}>Edit Supplement Guide</DropdownMenuItem>
                        {membership.type === 'Fitness Pillar' && (
                          <DropdownMenuItem onSelect={() => handleViewCustomer(membership)}>
                            View Customer Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDelete(membership)} className="text-red-500">
                          Delete Membership
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && memberships.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No memberships found in this category.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {selectedMembership && (
        <>
          <EditMembershipDialog 
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            membership={selectedMembership}
            onDialogClose={onDialogClose}
          />
          <DeleteMembershipDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            membership={selectedMembership}
            onDialogClose={onDialogClose}
          />
        </>
      )}

      {selectedCustomer && (
        <ViewCustomerDialog
          isOpen={isViewCustomerDialogOpen}
          onOpenChange={setIsViewCustomerDialogOpen}
          customer={selectedCustomer}
          orders={customerOrders}
        />
      )}
    </>
  );
}



