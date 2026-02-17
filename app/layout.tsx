import type { Metadata } from 'next';
import { SessionProvider } from '@/app/providers/session-provider';
import { ThemeProvider } from '@/app/providers/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { CategoriesSidebar } from '@/components/layout/categories-sidebar';
import { AgeGateModal } from '@/components/compliance/age-gate-modal';
import './globals.css';
import { SidebarProvider } from '@/components/providers/sidebar-provider';
import { AuthModalProvider } from '@/components/providers/auth-modal-provider';
import { AuthModal } from '@/components/auth/auth-modal';
import { AuthUrlListener } from '@/components/auth/auth-url-listener';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';

export const metadata: Metadata = {
  title: 'eddythedaddy - Adult Video Platform',
  description: 'Premium adult entertainment platform',
  other: {
    'rating': 'RTA-5042-1996-1400-1577-RTA',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <link rel="rating" href="https://www.rtalabel.org/index.php?content=icalp" />
      </head>
      <body className="antialiased bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AuthModalProvider>
                <AgeGateModal />
                <Navbar />
                <Suspense fallback={null}>
                  <AuthUrlListener />
                  <AuthModal />
                </Suspense>
                <div className="flex flex-col min-h-screen">
                  <div className="flex flex-1">
                    <CategoriesSidebar />
                    <main className="flex-1 w-full relative lg:pl-64">{children}</main>
                  </div>
                  <div className="lg:pl-64">
                    {/* Fixed Footer Ad (728x90) or Mobile (300x50/300x100) */}
                    <div className="flex flex-col items-center justify-center my-6 gap-4">
                       <AdUnit 
                         zoneId={adConfig.exoclick.footerZoneId} 
                         width={728} 
                         height={90} 
                         className="hidden md:block shadow-sm"
                         fallbackText="728x90 Banner"
                       />
                       <AdUnit 
                         zoneId={adConfig.exoclick.mobileZoneId} 
                         width={300} 
                         height={50} 
                         className="block md:hidden shadow-sm"
                         fallbackText="Mobile Banner"
                       />
                    </div>
                    <Footer />
                  </div>
                </div>
              </AuthModalProvider>
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
