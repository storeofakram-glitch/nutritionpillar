
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Order, Product } from "@/types";
import { getOrders } from "@/services/order-service";
import { getProducts } from "@/services/product-service";
import { dzStates } from "@/lib/dz-states";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ExportType = 'email' | 'phone' | 'both';

export default function CustomerExportForm() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [exportType, setExportType] = useState<ExportType>('email');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [ordersData, productsData] = await Promise.all([
                getOrders(),
                getProducts(),
            ]);
            setOrders(ordersData);
            setProducts(productsData);
            setLoading(false);
        }
        loadData();
    }, []);

    const productCategories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return Array.from(cats).sort();
    }, [products]);

    const states = useMemo(() => {
        return dzStates.map(s => s.name).sort();
    }, []);
    
    const handleCategoryChange = (category: string, checked: boolean) => {
        setSelectedCategories(prev => 
            checked ? [...prev, category] : prev.filter(c => c !== category)
        );
    };
    
    const handleSelectAllCategories = (checked: boolean) => {
        setSelectedCategories(checked ? productCategories : []);
    };

    const handleStateChange = (state: string, checked: boolean) => {
        setSelectedStates(prev => 
            checked ? [...prev, state] : prev.filter(s => s !== state)
        );
    };

    const handleSelectAllStates = (checked: boolean) => {
        setSelectedStates(checked ? states : []);
    };


    const handleDownload = () => {
        if (loading) return;

        let filteredOrders = orders;

        // Filter by state if any are selected
        if (selectedStates.length > 0) {
            filteredOrders = filteredOrders.filter(order => selectedStates.includes(order.shippingAddress.state));
        }

        // Filter by category if any are selected
        if (selectedCategories.length > 0) {
            filteredOrders = filteredOrders.filter(order => 
                order.items.some(item => selectedCategories.includes(item.product.category))
            );
        }
        
        if (filteredOrders.length === 0) {
            toast({
                variant: 'destructive',
                title: "No Customers Found",
                description: "No customers match the selected criteria.",
            });
            return;
        }

        if (exportType === 'both') {
            const customerMap = new Map<string, {name: string, email: string, phone: string}>();
            filteredOrders.forEach(order => {
                if (!customerMap.has(order.customer.email)) {
                    customerMap.set(order.customer.email, {
                        name: order.customer.name,
                        email: order.customer.email,
                        phone: order.shippingAddress.phone,
                    });
                }
            });
            const customerList = Array.from(customerMap.values());
            const csvHeader = "Name,Email,Phone";
            const csvRows = customerList.map(c => `"${c.name}","${c.email}","${c.phone}"`);
            const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `customer_list_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const contactSet = new Set<string>();
            filteredOrders.forEach(order => {
                if (exportType === 'email') {
                    if (order.customer.email) {
                        contactSet.add(order.customer.email);
                    }
                } else { // phone
                    if (order.shippingAddress.phone) {
                        contactSet.add(order.shippingAddress.phone);
                    }
                }
            });
            
            const contactList = Array.from(contactSet);

            if (contactList.length === 0) {
                toast({
                    variant: 'destructive',
                    title: "No Contacts Found",
                    description: `No customers had a valid ${exportType} for the selected criteria.`,
                });
                return;
            }

            const csvContent = "data:text/csv;charset=utf-8," + [exportType, ...contactList].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `customer_list_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        toast({
            title: "Download Started",
            description: `Your customer list is downloading.`
        });
    };

    const CheckboxList = ({ title, items, selectedItems, onCheckedChange, onSelectAll }: { title: string; items: string[]; selectedItems: string[]; onCheckedChange: (item: string, checked: boolean) => void; onSelectAll: (checked: boolean) => void; }) => (
        <div className="space-y-2">
            <h3 className="font-semibold text-sm">{title} ({selectedItems.length || 'All'})</h3>
            <ScrollArea className="h-40 rounded-md border p-4">
                 <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                        id={`select-all-${title}`}
                        checked={items.length > 0 && selectedItems.length === items.length}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                    />
                    <Label htmlFor={`select-all-${title}`} className="font-bold cursor-pointer">
                        Select All
                    </Label>
                </div>
                <Separator className="my-2" />
                {items.map(item => (
                    <div key={item} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                            id={`${title}-${item}`}
                            checked={selectedItems.includes(item)}
                            onCheckedChange={(checked) => onCheckedChange(item, !!checked)}
                        />
                        <Label htmlFor={`${title}-${item}`} className="text-sm font-normal cursor-pointer">
                            {item}
                        </Label>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-40" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer List Exporter</CardTitle>
                <CardDescription>
                    Create targeted customer lists by filtering based on their purchased product categories and location. 
                    If no filters are selected, the list will include all customers.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CheckboxList 
                        title="Filter by Product Category" 
                        items={productCategories} 
                        selectedItems={selectedCategories}
                        onCheckedChange={handleCategoryChange} 
                        onSelectAll={handleSelectAllCategories}
                    />
                    <CheckboxList 
                        title="Filter by State (Wilaya)" 
                        items={states} 
                        selectedItems={selectedStates}
                        onCheckedChange={handleStateChange}
                        onSelectAll={handleSelectAllStates}
                    />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Select Export Type</h3>
                    <RadioGroup value={exportType} onValueChange={(val) => setExportType(val as ExportType)} className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email" className="cursor-pointer">Emails</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phone" id="phone" />
                            <Label htmlFor="phone" className="cursor-pointer">Phone Numbers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both" className="cursor-pointer">Both</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                <Button onClick={handleDownload} disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Customer List
                </Button>
            </CardContent>
        </Card>
    );
}
