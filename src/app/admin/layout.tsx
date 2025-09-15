
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset
} from "@/components/ui/sidebar"
import { Home, Package, ShoppingCart, Truck, Users, ArrowLeft, DollarSign, Brush, ShieldCheck, Megaphone, Mail, UserCheck, LogOut } from "lucide-react"
import Header from "@/components/layout/header"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/inbox", label: "Inbox", icon: Mail },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/coaches", label: "Coaches", icon: UserCheck },
    { href: "/admin/shipping", label: "Shipping", icon: Truck },
    { href: "/admin/finance", label: "Finance", icon: DollarSign },
    { href: "/admin/membership", label: "Membership", icon: ShieldCheck },
    { href: "/admin/appearance", label: "Appearance", icon: Brush },
    { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  ]
  
  React.useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);
  
  if (loading || !isAdmin) {
    // You can return a loading spinner or null here
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
        </div>
    );
  }
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-headline font-semibold">Nutrition Pillar</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="pt-8">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton 
                        isActive={pathname.startsWith(item.href) && (item.href === '/admin' ? pathname === item.href : true) }
                        tooltip={item.label}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Sign Out" onClick={handleSignOut}>
                        <LogOut />
                        <span>Sign Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/">
                        <SidebarMenuButton tooltip="Back to site">
                            <ArrowLeft />
                            <span>Back to Site</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="max-w-full flex-1">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                    <h1 className="text-base md:text-lg font-semibold font-headline">
                        {navItems.find(item => pathname.startsWith(item.href) && (item.href === '/admin' ? pathname === item.href : true))?.label || 'Admin'}
                    </h1>
                </div>
                <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                    <LogOut className="h-4 w-4"/>
                    <span className="hidden md:inline">Sign Out</span>
                </Button>
            </header>
            <main className="p-6">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
