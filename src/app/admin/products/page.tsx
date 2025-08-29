import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddProductDialog from "./_components/add-product-dialog"
import ProductTable from "./_components/product-table"

export default function AdminProductsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your products and view their sales performance.</CardDescription>
            </div>
            <AddProductDialog />
        </div>
      </CardHeader>
      <CardContent>
        <ProductTable />
      </CardContent>
    </Card>
  )
}
