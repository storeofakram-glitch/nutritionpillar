
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddProductDialog from "./_components/add-product-dialog"
import ProductTable from "./_components/product-table"
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getAuth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { firebaseApp, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


export default function AdminProductsPage({ authLoading }: { authLoading?: boolean }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const testWrite = async () => {
    const auth = getAuth(firebaseApp);
    console.log('=== WRITE TEST ===');
    console.log('Current user:', auth.currentUser);
    
    if (!auth.currentUser) {
      console.log('❌ No authenticated user at time of write');
      toast({
        variant: "destructive",
        title: "Write Test Failed",
        description: "No authenticated user found. Check console.",
      });
      return;
    }
    
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        name: 'Test Product',
        description: 'This is a test product from a debug write.',
        category: 'Test',
        price: 100,
        quantity: 1,
        imageUrls: ['https://picsum.photos/400'],
        createdAt: new Date().toISOString()
      });
      console.log('✅ Write successful! Doc ID:', docRef.id);
      toast({
        title: "Write Test Successful!",
        description: "Check the console and your database.",
      });
      handleRefresh(); // Refresh the table to see the new product
    } catch (error: any) {
      console.log('❌ Write failed:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      toast({
        variant: "destructive",
        title: "Write Test Failed",
        description: `Check the console. Error: ${error.message}`,
      });
    }
    console.log('=== END WRITE TEST ===');
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
              <Button variant="outline" size="sm" onClick={testWrite} disabled={authLoading}>
                Test Database Write
              </Button>
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
        <ProductTable key={refreshKey} />
      </CardContent>
    </Card>
  )
}
