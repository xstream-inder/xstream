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

export const metadata: Metadata = {
  title: 'XStream - Adult Video Platform',
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
                <AuthModal />
                <div className="flex min-h-screen">
                  <CategoriesSidebar />
                  <main className="flex-1 w-full relative">{children}</main>
                </div>
              </AuthModalProvider>
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
