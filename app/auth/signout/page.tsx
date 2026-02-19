'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">
          eddythe<span className="text-xred-600">daddy</span>
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Are you sure you want to sign out?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-6 py-2.5 bg-xred-600 text-white font-medium rounded-lg hover:bg-xred-700 transition-colors disabled:opacity-50"
          >
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
