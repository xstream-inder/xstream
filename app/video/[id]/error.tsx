'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function VideoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-6">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load video</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        We couldn&apos;t load this video. It may have been removed or there was a temporary error.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-xred-600 text-white font-medium rounded-lg hover:bg-xred-700 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
