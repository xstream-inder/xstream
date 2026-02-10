'use client';

import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from  'next/navigation';
import { registerUser } from '@/server/actions/auth';
import Link from 'next/link';

export function AuthModal() {
  const { isOpen, view, openModal, closeModal } = useAuthModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: signInData.email,
        password: signInData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else if (result?.ok) {
        closeModal();
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      Object.entries(signUpData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      const result = await registerUser(formDataObj);

      if (result.success) {
        setSuccess('Account created! Please sign in.');
        setTimeout(() => {
          setSuccess('');
          openModal('signin');
          setSignInData(prev => ({ ...prev, email: signUpData.email }));
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeModal}
      />
      
      {/* Modal / Card */}
      <div className="flex min-h-screen items-center justify-center p-0 sm:p-4">
        <div className="relative w-full max-w-md transform overflow-hidden bg-white dark:bg-dark-900 shadow-2xl transition-all sm:rounded-2xl h-full sm:h-auto min-h-screen sm:min-h-0 flex flex-col">
          
          {/* Close Button */}
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">
              X<span className="text-xred-600">Stream</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {view === 'signin' 
                ? 'Welcome back! Sign in to continue.' 
                : 'Join the community for free!'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => { setError(''); setSuccess(''); openModal('signin'); }}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                view === 'signin'
                  ? 'border-b-2 border-xred-600 text-xred-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setError(''); setSuccess(''); openModal('signup'); }}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                view === 'signup'
                  ? 'border-b-2 border-xred-600 text-xred-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-8 flex-1 overflow-y-auto">
             {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                {success}
              </div>
            )}

            {view === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-xred-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <Link 
                      href="/auth/reset" 
                      onClick={closeModal}
                      className="text-xs text-xred-600 hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-xred-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-xred-600 hover:bg-xred-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-xred-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-xred-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-xred-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-xred-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-xred-600 hover:bg-xred-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
