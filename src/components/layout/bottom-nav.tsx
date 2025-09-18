'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShieldCheck, Users, Search } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import { SearchDialog } from '../search-dialog';
import { Button } from '../ui/button';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navLinks = [
    { href: '/', label: 'Shop', icon: Home },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, count: cartCount },
    { href: '/membership', label: 'Membership', icon: ShieldCheck },
    { href: '/join-our-team', label: 'Team', icon: Users },
  ];

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(10); // Vibrate for 10ms for a gentle tap effect
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={handleNavClick}
            className={cn(
              'flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary',
              (pathname === link.href) && 'text-primary'
            )}
          >
            <div className="relative">
                <link.icon className="h-6 w-6" />
                {link.count > 0 && (
                    <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {link.count}
                    </span>
                )}
            </div>
            <span>{link.label}</span>
          </Link>
        ))}
         <SearchDialog>
            <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs text-muted-foreground h-auto p-0">
                <Search className="h-6 w-6" />
                <span>Search</span>
            </Button>
         </SearchDialog>
      </div>
    </nav>
  );
}
