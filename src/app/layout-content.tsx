
'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BottomNav from '@/components/layout/bottom-nav';
import { usePathname } from 'next/navigation';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="relative flex min-h-dvh flex-col bg-background">
            {!isAdminPage && <Header />}
            <main className="flex-1 pb-24 md:pb-0">{children}</main>
            {!isAdminPage && <Footer />}
            {!isAdminPage && <BottomNav />}
        </div>
    )
}
