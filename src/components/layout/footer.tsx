
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSiteSettings } from '@/services/site-settings-service';
import type { SocialLinks } from '@/types';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getSiteSettings();
      if (settings?.socialLinks) {
        setSocialLinks(settings.socialLinks);
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="border-t">
      <div className="container grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-8 text-center md:text-left">
        <div className="md:col-span-1">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nutrition Pillar. All Rights Reserved.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-1 md:col-span-1">
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

        <div className="flex items-center justify-center md:justify-end gap-4 text-xs text-muted-foreground md:col-span-1">
            <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
