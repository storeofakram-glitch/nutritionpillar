
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
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="order-2 md:order-1 flex items-center justify-center md:justify-start">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nutrition Pillar. All Rights Reserved.
            </p>
          </div>
          
          <div className="order-1 md:order-2 flex items-center justify-center gap-1">
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

          <div className="order-3 md:order-3 hidden md:flex justify-end">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
