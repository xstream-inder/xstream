'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-dark-700 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => openModal('signin')}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Sign in
        </button>
        <button
          onClick={() => openModal('signup')}
          className="px-4 py-2 text-sm font-medium text-white bg-xred-600 rounded-lg hover:bg-xred-700"
        >
          Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="User menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="h-8 w-8 rounded-full bg-xred-600 flex items-center justify-center text-white font-medium">
          {session.user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="hidden md:inline text-sm font-medium text-gray-900 dark:text-white">
          {session.user.username}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 z-50" role="menu">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user.email}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Role: {session.user.role}
              </p>
            </div>

            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Your Profile
            </Link>

            {session.user.role === 'CREATOR' || session.user.role === 'ADMIN' ? (
              <Link
                href="/upload"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                Upload Video
              </Link>
            ) : null}

            <Link
              href="/studio"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Creator Studio
            </Link>

            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Settings
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSignOut}
                role="menuitem"
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
