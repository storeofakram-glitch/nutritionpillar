
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Twitter, Music, Menu, ShoppingBag, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"
import * as React from 'react';
import Image from 'next/image';
import type { SocialLinks } from '@/types';
import { getSiteSettings } from '@/services/site-settings-service';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';


const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/membership', label: 'Membership' },
    { href: '/contact', label: 'Contact' },
    { href: '/join-our-team', label: 'Join Our Team' },
];

export default function Header() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [socialLinks, setSocialLinks] = React.useState<SocialLinks>({});
  const { language, setLanguage } = useLanguage();

  React.useEffect(() => {
    async function fetchSettings() {
      const settings = await getSiteSettings();
      if (settings?.socialLinks) {
        setSocialLinks(settings.socialLinks);
      }
    }
    fetchSettings();
  }, []);
  
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
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 flex items-center gap-4 md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm bg-background text-foreground flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <Link href="/" className="flex items-center space-x-2 pt-4">
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
                    </SheetHeader>
                   <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                       {navLinks.map(link => (
                          <SheetClose asChild key={link.href}>
                             <NavLink href={link.href}>{link.label}</NavLink>
                          </SheetClose>
                        ))}
                   </nav>
                   <div className="mt-auto pt-6 border-t">
                     <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
                        <SheetClose asChild>
                            <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                        </SheetClose>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={socialLinks.facebook || '#'} aria-label="Facebook"><Facebook className="h-5 w-5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={socialLinks.instagram || '#'} aria-label="Instagram"><Instagram className="h-5 w-5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={socialLinks.youtube || '#'} aria-label="YouTube"><Youtube className="h-5 w-5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={socialLinks.linkedin || '#'} aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={socialLinks.twitter || '#'} aria-label="Twitter"><Twitter className="h-5 w-5" /></Link>
                        </Button>
                    </div>
                   </div>
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
          <span className="font-bold font-headline text-base md:text-lg">Nutrition Pillar</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(link => (
              <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end">
           <div className="flex items-center gap-2">
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

               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Globe className="h-5 w-5" />
                            <span className="sr-only">Change language</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setLanguage('en')}>
                            <span>English</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setLanguage('ar')}>
                            <span>العربية</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </div>
    </header>
  );
}
