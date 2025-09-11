
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Nutrition Pillar. All Rights Reserved.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></Link>
            </Button>
             <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="YouTube"><Youtube className="h-5 w-5" /></Link>
            </Button>
             <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></Link>
            </Button>
             <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></Link>
            </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
