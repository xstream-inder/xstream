'use client';

import { useActionState } from 'react';
import { submitDMCA } from '@/server/actions/legal';

interface State {
  success: boolean;
  message?: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
}

const initialState: State = {
  success: false,
  message: '',
  errors: {},
};

export default function DMCAPage() {
  const [state, formAction, isPending] = useActionState(submitDMCA, initialState);

  if (state.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Submitted</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We have received your DMCA takedown request and will review it shortly. You will receive a confirmation email.
          </p>
          <button
             onClick={() => window.location.reload()}
             className="text-xred-600 hover:text-xred-500 font-medium"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            DMCA Copyright Infringement Notification
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Use this form to report content that you believe violates your copyright.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 shadow rounded-lg overflow-hidden">
          <div className="p-8">
            <form action={formAction} className="space-y-6">
              
              {state.message && !state.success && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                  {state.message}
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name (Copyright Holder) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                    />
                    {state.errors?.fullName && <p className="mt-1 text-sm text-red-600">{state.errors.fullName}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                    />
                     {state.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mailing Address *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      required
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                    />
                     {state.errors?.address && <p className="mt-1 text-sm text-red-600">{state.errors.address}</p>}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL of Infringing Content *
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="contentUrl"
                      id="contentUrl"
                      required
                      placeholder="https://xstream.dev/video/..."
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                    />
                     {state.errors?.contentUrl && <p className="mt-1 text-sm text-red-600">{state.errors.contentUrl}</p>}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description of Infringement *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                      placeholder="Please describe how the content infringes upon your copyright..."
                    />
                     {state.errors?.description && <p className="mt-1 text-sm text-red-600">{state.errors.description}</p>}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreed"
                        name="agreed"
                        type="checkbox"
                        required
                        className="focus:ring-xred-500 h-4 w-4 text-xred-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreed" className="font-medium text-gray-700 dark:text-gray-300">
                        I hereby state that I have a good faith belief that the use of the copyrighted material is not authorized by the copyright owner, its agent, or the law. I state under penalty of perjury that the information in this notice is accurate and that I am the copyright owner or authorized to act on behalf of the owner.
                      </label>
                       {state.errors?.agreed && <p className="mt-1 text-sm text-red-600">{state.errors.agreed}</p>}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="signature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Electronic Signature (Type Full Name) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="signature"
                      id="signature"
                      required
                      className="block w-full rounded-md border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 dark:bg-dark-700 dark:text-white sm:text-sm p-2 border"
                    />
                     {state.errors?.signature && <p className="mt-1 text-sm text-red-600">{state.errors.signature}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-xred-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-xred-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 disabled:opacity-50"
                >
                  {isPending ? 'Submitting...' : 'Submit Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
