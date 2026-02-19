import { auth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/user/profile-form';
import { createCustomerPortal } from '@/server/actions/stripe';
import Link from 'next/link';

export const metadata = {
  title: 'Settings - eddythedaddy',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?auth=signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      authProvider: true, 
      role: true,
      isPremium: true,
      stripeCurrentPeriodEnd: true,
    }
  });

  if (!user) {
      redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
               Account Settings
           </h1>
           <p className="text-gray-500 dark:text-gray-400">
             Manage your profile and subscription preferences.
           </p>
        </div>
        
        {/* Subscription Card */}
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6 border border-gray-200 dark:border-dark-700">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Subscription Plan</h2>
           <div className="flex items-center justify-between">
              <div>
                 {user.isPremium ? (
                    <div>
                       <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-900 dark:text-white mr-2">Premium Member</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Active</span>
                       </div>
                       <p className="text-sm text-gray-500 mt-1">
                          Renews on {user.stripeCurrentPeriodEnd ? new Date(user.stripeCurrentPeriodEnd).toLocaleDateString() : 'Unknown'}
                       </p>
                    </div>
                 ) : (
                    <div>
                       <div className="text-lg font-medium text-gray-900 dark:text-white">Free Plan</div>
                       <p className="text-sm text-gray-500 mt-1">Upgrade to unlock premium features and remove ads.</p>
                    </div>
                 )}
              </div>
              
              <div className="ml-4">
                 {user.isPremium ? (
                    <form action={createCustomerPortal}>
                       <button 
                          type="submit"
                          className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                       >
                          Manage Subscription
                       </button>
                    </form> 
                 ) : (
                    <Link
                       href="/premium"
                       className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                       Upgrade to Premium
                    </Link>
                 )}
              </div>
           </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6 border border-gray-200 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Details</h2>
            <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
