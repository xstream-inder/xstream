'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const AGE_GATE_KEY = 'age_verified';

export function AgeGateModal() {
  const [showModal, setShowModal] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [tosChecked, setTosChecked] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem(AGE_GATE_KEY);
    if (!verified) {
      setShowModal(true);
    }
  }, []);

  const canEnter = ageChecked && tosChecked;

  const handleEnter = () => {
    if (!canEnter) return;
    localStorage.setItem(AGE_GATE_KEY, 'true');
    setShowModal(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-md w-full p-8 text-center">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Age Verification Required
        </h2>

        {/* Warning Text */}
        <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm">
            This website contains age-restricted materials including nudity and explicit depictions of sexual activity.
          </p>
          <p className="text-sm">
            By entering, you affirm that you are at least 18 years of age or the age of majority in the jurisdiction you are accessing the website from and you consent to viewing sexually explicit content.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-6 text-left">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={ageChecked}
              onChange={(e) => setAgeChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-xred-600 focus:ring-xred-500 accent-xred-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              I confirm that I am at least <strong>18 years of age</strong> or the age of majority in my jurisdiction.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={tosChecked}
              onChange={(e) => setTosChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-xred-600 focus:ring-xred-500 accent-xred-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              I have read and agree to the{' '}
              <Link href="/legal/terms" className="text-blue-600 hover:underline" target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline" target="_blank">
                Privacy Policy
              </Link>.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleEnter}
            disabled={!canEnter}
            className="w-full px-6 py-3 bg-xred-600 text-white font-semibold rounded-lg hover:bg-xred-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-xred-600"
          >
            I am 18 or older - Enter
          </button>
          <button
            onClick={handleExit}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
          >
            I am under 18 - Exit
          </button>
        </div>

        {/* Legal Notice */}
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Our parental controls page explains how you can easily block access to this site.
          By using this site, you also agree to our{' '}
          <Link href="/legal/cookies" className="text-blue-500 hover:underline" target="_blank">
            Cookie Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}
