import { auth } from '@/lib/auth-helper';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      videos: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          videos: true,
          subscribers: true,
          subscriptions: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user.email}
            </p>
            
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user._count.videos}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user._count.subscribers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user._count.subscriptions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {user.role}
              </span>
              {user.isVerified && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Videos
        </h2>
        
        {user.videos.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            You haven't uploaded any videos yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.videos.map((video: any) => (
              <div key={video.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {video.viewsCount} views
                </p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                  video.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  video.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                  video.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {video.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
