
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddProductDialog from "./_components/add-product-dialog"
import ProductTable from "./_components/product-table"
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";


export default function AdminProductsPage({ authLoading }: { authLoading?: boolean }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setSearchTerm("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your products and view their sales performance.</CardDescription>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name..."
                        className="pl-8 sm:w-[200px] lg:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={authLoading}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
              <AddProductDialog onProductAdded={handleRefresh} />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* The key prop ensures the component re-mounts and re-fetches data */}
        <ProductTable key={refreshKey} searchTerm={searchTerm} />
      </CardContent>
    </Card>
  )
}
