"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
import { Dumbbell, Home, Package, ShoppingCart, Tag, Truck, Users, BrainCircuit, ArrowLeft } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/shipping", label: "Shipping", icon: Truck },
    { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
    { href: "/admin/ai-tools", label: "AI Tools", icon: BrainCircuit },
  ]
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
                <Dumbbell className="size-6 text-primary" />
                <span className="text-lg font-headline font-semibold">FitFactor</span>
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
                    <h1 className="text-lg font-semibold font-headline">
                        {navItems.find(item => pathname.startsWith(item.href) && (item.href === '/admin' ? pathname === item.href : true))?.label || 'Admin'}
                    </h1>
                </div>
            </header>
            <main className="p-6">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
