import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import { notFound } from 'next/navigation';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';
import { auth } from '@/lib/auth-helper';
import { SubscribeButton } from '@/components/video/subscribe-button';
import Link from 'next/link';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return {
    title: `${username}'s Channel - eddythedaddy`,
    description: `Watch videos uploaded by ${username} on eddythedaddy.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();

  // Fetch User and their videos
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          subscribers: true,
          videos: true,
        },
      },
      videos: {
        where: {
          status: 'PUBLISHED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwner = session?.user?.username === user.username;

  // Check if current user is subscribed to this profile
  let isSubscribed = false;
  if (session?.user?.id && !isOwner) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId: session.user.id,
          creatorId: user.id,
        },
      },
    });
    isSubscribed = !!subscription;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Channel Header */}
      <div className="bg-gray-100 dark:bg-dark-950 border-b border-gray-200 dark:border-dark-800">
        <div className="max-w-[1800px] mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-dark-900 shadow-md" />
               ) : (
                 <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-xred-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-dark-900 shadow-md">
                   {user.username[0].toUpperCase()}
                 </div>
               )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{user._count.subscribers} Subscribers</span>
                    <span>•</span>
                    <span>{user._count.videos} Videos</span>
                </div>
                
                {isOwner ? (
                    <Link
                      href="/settings"
                      className="px-6 py-2 bg-gray-200 dark:bg-dark-800 text-gray-800 dark:text-gray-200 font-medium rounded-full hover:bg-gray-300 dark:hover:bg-dark-700 transition-colors inline-block"
                    >
                        Edit Profile
                    </Link>
                ) : (
                    <SubscribeButton
                      creatorId={user.id}
                      initialIsSubscribed={isSubscribed}
                      initialSubscriberCount={user._count.subscribers}
                    />
                )}
            </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-950 sticky top-[64px] z-10">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            <div className="py-4 text-sm font-medium border-b-2 border-xred-600 text-xred-600">
              Videos <span className="ml-1 text-xs bg-gray-100 dark:bg-dark-800 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">{user._count.videos}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-8">
          <div className="mb-8">
              
              {user.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {user.videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">This user hasn&apos;t uploaded any videos yet.</p>
                </div>
              )}
          </div>
          
          {/* Ad Slot */}
          <div className="my-8 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Channel Banner"
             />
          </div>
      </div>
    </div>
  );
}
