
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
      <div className="container relative py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="order-2 md:order-1 flex-1">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nutrition Pillar. All Rights Reserved.
            </p>
          </div>
          
          <div className="order-1 md:order-2 flex flex-1 items-center justify-center gap-1">
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

          <div className="order-3 md:order-3 flex-1 flex justify-center md:justify-end">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
