'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { useSidebar } from '@/components/providers/sidebar-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { toggle } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Left Section: Menu & Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger (Mobile/Tablet) - Toggles Sidebar */}
            <button
              onClick={toggle}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-xred-600 dark:hover:text-xred-500 focus:outline-none"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                X<span className="text-xred-600">Stream</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Optional, maybe move to sidebar like xhamster) */}
             <div className="hidden md:flex ml-6 space-x-6">
              <Link
                href="/new"
                className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-xred-600 dark:hover:text-xred-500 uppercase tracking-wide"
              >
                New
              </Link>
              <Link
                href="/best"
                className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-xred-600 dark:hover:text-xred-500 uppercase tracking-wide"
              >
                Best
              </Link>
            </div>
          </div>

          {/* Center: Search Bar (Hidden on small mobile, visible on larger screens) */}
          <div className="hidden sm:block flex-1 max-w-xl mx-4">
             <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-xred-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-gray-50 dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-dark-900 focus:ring-1 focus:ring-xred-500 focus:border-xred-500 sm:text-sm transition-colors"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>
          </div>

          {/* Right Section: Mobile Search Trigger & User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
             {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-xred-600"
              aria-label="Toggle search"
            >
              {isSearchOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Upload Button (CTA) */}
            <div className="hidden sm:block">
              <Link
                href="/upload"
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-xred-600 hover:bg-xred-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </Link>
            </div>

            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Overlay */}
      {isSearchOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-900 p-2 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="relative">
            <input
              autoFocus
              type="text"
              className="block w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-gray-50 dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-dark-900 focus:ring-1 focus:ring-xred-500 focus:border-xred-500 text-base"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-xred-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}

