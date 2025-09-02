
'use client';

import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import * as React from 'react';
import { SearchDialog } from '../search-dialog';
import Image from 'next/image';


export default function Header() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];
  
  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link
      href={href}
      onClick={() => setIsSheetOpen(false)}
      className={cn(
        'transition-colors hover:text-primary',
        pathname === href ? 'text-primary font-semibold' : 'text-foreground/80'
      )}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-4 md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
                    <SheetHeader className="text-left">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                   <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                       {navLinks.map(link => (
                          <SheetClose asChild key={link.href}>
                             <NavLink href={link.href}>{link.label}</NavLink>
                          </SheetClose>
                        ))}
                   </nav>
                </SheetContent>
            </Sheet>
        </div>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="https://github.com/akramFit/Nutrition-Pillar-Assets/blob/main/logo%20nutrition%20pillar.png?raw=true"
            alt="Nutrition Pillar Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
            data-ai-hint="logo"
          />
          <span className="font-bold font-headline text-lg">Nutrition Pillar</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(link => (
              <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
           <SearchDialog />
           <Link
            href="/admin"
            className={cn(
                'text-sm transition-colors hover:text-primary text-foreground/80 hidden sm:inline-block',
                pathname.startsWith('/admin') && 'text-primary font-semibold'
            )}
            >
                Admin
          </Link>
          <Button asChild variant="ghost" size="icon">
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
