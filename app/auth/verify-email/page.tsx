'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/server/actions/verification';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError('Missing token!');
      return;
    }

    verifyEmail(token)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
        }
      })
      .catch(() => {
        setError('Something went wrong!');
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Confirming your verification
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your email address.
          </p>
        </div>

        <div className="flex items-center justify-center w-full my-8">
          {!success && !error && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          )}
          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md w-full text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md w-full text-center">
              {error}
            </div>
          )}
        </div>

        <div className="text-center">
            <Link 
              href="/auth/signin"
              className="text-red-600 hover:text-red-500 font-medium"
            >
              Back to Sign In
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
