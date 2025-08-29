
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddProductDialog from "./_components/add-product-dialog"
import ProductTable from "./_components/product-table"
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AdminProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your products and view their sales performance.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
              <AddProductDialog />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ProductTable key={refreshKey} />
      </CardContent>
    </Card>
  )
}
