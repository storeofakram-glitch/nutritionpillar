
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import FirebaseProvider from '@/components/firebase-provider';
import { ptSans, spaceGrotesk } from './fonts';
import type { Metadata, Viewport } from 'next';
import LayoutContent from './layout-content';
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';

export const metadata: Metadata = {
  title: 'Nutrition Pillar - Your Complete Platform for Supplements & Sports Coaching',
  description: 'High-quality supplements to fuel your fitness journey.',
  icons: {
    icon: [
        { url: 'https://github.com/storeofakram-glitch/NutritionPillar/blob/main/main%20logo%20nutrition%20pillar.png?raw=true', href: 'https://github.com/storeofakram-glitch/NutritionPillar/blob/main/main%20logo%20nutrition%20pillar.png?raw=true' },
        { url: '/favicon.png', href: '/favicon.png' },
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="theme-color" content="#193382" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans', ptSans.variable, spaceGrotesk.variable)}>
        <FirebaseProvider>
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <LayoutContent>{children}</LayoutContent>
                <Toaster />
              </CartProvider>
            </LanguageProvider>
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
