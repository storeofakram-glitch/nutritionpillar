
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
import { Home, Package, ShoppingCart, Truck, Users, ArrowLeft, DollarSign, Brush, ShieldCheck, Megaphone, Mail, UserCheck, LogOut, ClipboardList } from "lucide-react"
import Header from "@/components/layout/header"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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
    { href: "/admin/team-management", label: "Team Management", icon: ClipboardList },
    { href: "/admin/shipping", label: "Shipping", icon: Truck },
    { href: "/admin/finance", label: "Finance", icon: DollarSign },
    { href: "/admin/finance-coaching", label: "Finance (Coaching)", icon: DollarSign },
    { href: "/admin/membership", label: "Membership", icon: ShieldCheck },
    { href: "/admin/appearance", label: "Appearance", icon: Brush },
    { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  ]
  
  React.useEffect(() => {
    // This effect runs whenever the loading or isAdmin state changes.
    // It ensures that only authenticated admins can see the content.
    if (!loading && !isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, loading, router]);
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  // While loading or if the user is not an admin (and not yet redirected),
  // show a loading skeleton or nothing to prevent content flashing.
  if (loading || !isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                 <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                 <p className="text-muted-foreground">Loading Admin Dashboard...</p>
            </div>
        </div>
    );
  }

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
              {navItems.map((item) => {
                const isFinancePage = item.href === '/admin/finance';
                const isActive = isFinancePage 
                    ? pathname === item.href 
                    : (item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href));

                return (
                    <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton 
                            isActive={isActive}
                            tooltip={item.label}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                    </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Sign Out" onClick={handleSignOut}>
                        <LogOut />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="max-w-full flex-1">
            <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 pr-16 md:pr-20">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                    <h1 className="text-base md:text-lg font-semibold font-headline">
                        {navItems.find(item => pathname === item.href)?.label || navItems.find(item => item.href !== '/admin' && pathname.startsWith(item.href))?.label || 'Admin'}
                    </h1>
                </div>
            </header>
             <Button variant="outline" size="icon" onClick={handleSignOut} className="fixed top-2 right-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <LogOut className="h-4 w-4"/>
                <span className="sr-only">Sign Out</span>
            </Button>
            <main className="p-6">
                {React.Children.map(children, child =>
                    React.isValidElement(child)
                    ? React.cloneElement(child, { authLoading: loading } as { authLoading: boolean })
                    : child
                )}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
