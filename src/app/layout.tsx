
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import FirebaseProvider from '@/components/firebase-provider';
import { ptSans, spaceGrotesk } from './fonts';
import type { Metadata, Viewport } from 'next';
import LayoutContent from './layout-content';

export const metadata: Metadata = {
  title: 'Nutrition Pillar - Your Supplement Marketplace',
  description: 'High-quality supplements to fuel your fitness journey.',
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
        <link rel="icon" href="https://github.com/akramFit/Nutrition-Pillar-Assets/blob/main/logo%20nutrition%20pillar.png?raw=true" />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans', ptSans.variable, spaceGrotesk.variable)}>
        <FirebaseProvider>
          <CartProvider>
            <LayoutContent>{children}</LayoutContent>
            <Toaster />
          </CartProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
