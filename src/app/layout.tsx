import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import FirebaseProvider from '@/components/firebase-provider';
import BottomNav from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: 'Nutrition Pillar - Your Supplement Marketplace',
  description: 'High-quality supplements to fuel your fitness journey.',
  icons: {
    icon: 'https://github.com/akramFit/Nutrition-Pillar-Assets/blob/main/logo%20nutrition%20pillar.png?raw=true',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
        <FirebaseProvider>
          <CartProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1 pb-24 md:pb-0">{children}</main>
              <Footer />
              <BottomNav />
            </div>
            <Toaster />
          </CartProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
