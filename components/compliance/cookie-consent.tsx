'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'cookie_consent';

interface CookiePreferences {
  essential: boolean;   // Always true
  analytics: boolean;
  functionality: boolean;
  advertising: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  functionality: false,
  advertising: false,
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functionality: true,
    advertising: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, functionality: true, advertising: true });
  };

  const acceptEssentialOnly = () => {
    saveConsent(DEFAULT_PREFERENCES);
  };

  const saveCustomPreferences = () => {
    saveConsent({ ...preferences, essential: true });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] animate-slide-up">
      <div className="bg-white dark:bg-dark-950 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4">
            {/* Main banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Cookie icon */}
              <div className="hidden sm:flex shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.716a1.004 1.004 0 0 0-1.029-1.27A3.007 3.007 0 0 1 14 7c-1.654 0-3-1.346-3-3a2.98 2.98 0 0 1 .5-1.653 1.003 1.003 0 0 0-.519-1.512C7.364.146 3.636 2.05 1.839 5.3A10.007 10.007 0 0 0 2.016 15.7a9.937 9.937 0 0 0 7.543 5.262A9.862 9.862 0 0 0 12 21.063c5.023 0 9.285-3.738 9.943-8.738a1.005 1.005 0 0 0-.345-.861zM12 19.063a7.876 7.876 0 0 1-1.953-.244 7.946 7.946 0 0 1-6.033-4.209 8.006 8.006 0 0 1-.14-8.334A7.966 7.966 0 0 1 8.07 2.588 4.985 4.985 0 0 0 9 4c0 2.757 2.243 5 5 5a4.977 4.977 0 0 0 1.654-.282A4.988 4.988 0 0 0 20 13c.058 0 .113-.008.17-.01A7.998 7.998 0 0 1 12 19.063zM7.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies. Read our{' '}
                  <Link href="/legal/cookies" className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank">
                    Cookie Policy
                  </Link>{' '}
                  to learn more.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Customize
                </button>
                <button
                  onClick={() => acceptEssentialOnly()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => acceptAll()}
                  className="px-4 py-2 text-sm font-medium text-white bg-xred-600 rounded-lg hover:bg-xred-700 transition-colors shadow-sm"
                >
                  Accept All
                </button>
              </div>
            </div>

            {/* Expandable details */}
            {showDetails && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Essential */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="mt-0.5 h-4 w-4 rounded accent-blue-600 cursor-not-allowed"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Essential Cookies</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Required for the website to function. Cannot be disabled.
                      </p>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Performance & Analytics</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Help us understand how visitors interact with the site.
                      </p>
                    </div>
                  </div>

                  {/* Functionality */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={preferences.functionality}
                      onChange={(e) => setPreferences(p => ({ ...p, functionality: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Functionality</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Remember preferences and provide enhanced features.
                      </p>
                    </div>
                  </div>

                  {/* Advertising */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={preferences.advertising}
                      onChange={(e) => setPreferences(p => ({ ...p, advertising: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Targeting & Advertising</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Used to deliver relevant ads and track campaigns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveCustomPreferences()}
                    className="px-5 py-2 text-sm font-medium text-white bg-xred-600 rounded-lg hover:bg-xred-700 transition-colors shadow-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
