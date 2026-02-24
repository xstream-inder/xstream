import { auth } from '@/lib/auth-helper';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/server/actions/stripe';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function PremiumPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/premium');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.isPremium) {
     redirect('/settings');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-800 p-8 rounded-lg shadow-lg text-center">
        <div>
           {/* Placeholder for a crown icon or logo */}
           <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
             👑
           </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Upgrade to Premium
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enjoy an uninterrupted experience with exclusive benefits.
          </p>
        </div>

        <div className="mt-8 space-y-4 text-left">
           <ul className="space-y-4">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                 <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 Ad-free viewing experience
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                 <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 Access to Premium-only videos
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                 <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 Support your favorite creators directly
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                 <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 High-resolution downloads
              </li>
           </ul>
        </div>

        <div className="mt-8">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
               $9.00<span className="text-lg font-medium text-gray-500">/ month</span>
            </div>
          <form action={createCheckoutSession}>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all transform hover:scale-105"
            >
              Subscribe Now
            </button>
          </form> 
          <p className="mt-4 text-xs text-gray-500">
             Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
