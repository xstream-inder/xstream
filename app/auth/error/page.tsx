'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error in constructing an authorization URL.',
  OAuthCallback: 'Error in handling the response from the OAuth provider.',
  OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
  EmailCreateAccount: 'Could not create email provider user in the database.',
  Callback: 'Error in the OAuth callback handler route.',
  OAuthAccountNotLinked: 'This email is already associated with another account. Please sign in with your original method.',
  CredentialsSignin: 'Invalid email or password. Please try again.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected authentication error occurred.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') || 'Default';
  const errorMessage = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Authentication Error
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-2.5 bg-xred-600 text-white font-medium rounded-lg hover:bg-xred-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
