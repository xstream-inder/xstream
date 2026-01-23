'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/providers/sidebar-provider';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface Category {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

interface SidebarProps {
  categories: Category[];
}

export function Sidebar({ categories }: SidebarProps) {
  const { isOpen, close } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    close();
  }, [pathname]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-gray-800">
       <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
          Categories
        </h2>

        <nav className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group ${
                pathname === `/category/${category.slug}`
                ? 'bg-xred-500/10 text-xred-600 dark:text-xred-500 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
              }`}
            >
              <span className="group-hover:text-xred-600 dark:group-hover:text-xred-500 transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {category.videoCount}
              </span>
            </Link>
          ))}
        </nav>

        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/models"
            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors group"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-400 group-hover:text-xred-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            All Models
          </Link>
        </div>
      </div>

      {/* Theme Toggle - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors group"
        >
          {mounted && theme === 'dark' ? (
            <>
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light Mode
            </>
          ) : (
             <>
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark Mode
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={close}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-900 shadow-xl transform transition-transform duration-300 ease-in-out">
             <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <span className="text-lg font-bold text-xred-600">Menu</span>
                <button 
                  onClick={close}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>
             <div className="h-[calc(100%-4rem)] overflow-y-auto">
                <SidebarContent />
             </div>
          </div>
        </div>
      )}
    </>
  );
}
