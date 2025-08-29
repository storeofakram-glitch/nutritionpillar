"use client"

import { useEffect, useState, useTransition } from "react"
import { MoreHorizontal } from "lucide-react"

import type { ShippingState } from "@/types"
import { getShippingOptions } from "@/services/shipping-service"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import EditShippingZoneDialog from "./edit-shipping-zone-dialog"
import DeleteShippingZoneDialog from "./delete-shipping-zone-dialog"

export default function ShippingZonesTable() {
  const [shippingOptions, setShippingOptions] = useState<ShippingState[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingState | null>(null);

  const fetchShippingOptions = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const fetchedOptions = await getShippingOptions()
        setShippingOptions(fetchedOptions)
      } catch (error) {
        console.error("Failed to fetch shipping options:", error)
      } finally {
        setLoading(false)
      }
    })
  }

  useEffect(() => {
    fetchShippingOptions()
  }, [])
  
  const handleEditClick = (zone: ShippingState) => {
    setSelectedZone(zone);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (zone: ShippingState) => {
    setSelectedZone(zone);
    setIsDeleteDialogOpen(true);
  }

  const onDialogClose = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedZone(null);
    fetchShippingOptions();
  }

  if (loading && !shippingOptions.length) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>State (Wilaya)</TableHead>
          <TableHead>Cities</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shippingOptions.map((option) => (
          <TableRow key={option.id}>
            <TableCell className="font-medium">{option.state}</TableCell>
            <TableCell>
              {option.cities.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link" className="p-0 h-auto font-normal">
                      {option.cities.length} {option.cities.length === 1 ? "city" : "cities"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                    <DropdownMenuLabel>Cities & Prices</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {option.cities.map(city => (
                      <DropdownMenuItem key={city.name} className="flex justify-between gap-4 cursor-default">
                        <span>{city.name}</span>
                        <span className="text-muted-foreground">${city.price}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-sm text-muted-foreground">No cities defined</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => handleEditClick(option)}>Edit</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleDeleteClick(option)} className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    
    {selectedZone && (
        <>
            <EditShippingZoneDialog 
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                shippingZone={selectedZone}
                onDialogClose={onDialogClose}
            />
            <DeleteShippingZoneDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                shippingZone={selectedZone}
                onDialogClose={onDialogClose}
            />
        </>
    )}
    </>
  )
}
