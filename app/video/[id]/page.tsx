import { prisma } from '@/lib/prisma';
import { VideoPlayer } from '@/components/video/video-player';
import { LikeButton } from '@/components/video/like-button';
import { ViewTracker } from '@/components/video/view-tracker';
import CommentSection from '@/components/comments/comment-section';
import { CommentWrapper } from '@/components/comments/comment-wrapper';
import { VideoTags } from '@/components/video/video-tags';
import { RelatedVideos } from '@/components/video/related-videos';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';
import { formatNumber } from '@/lib/utils';
import { getLikeStatus, getSubscriptionStatus } from '@/server/actions/engagement';
import { getViewCount } from '@/server/actions/view';
import { getComments } from '@/server/actions/comment';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth-helper';
import { SubscribeButton } from '@/components/video/subscribe-button';
import { ReportButton } from '@/components/video/report-button';
import { ShareButton } from '@/components/video/share-button';
import { cache } from 'react';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

// React cache() deduplicates this between generateMetadata and page render
const getVideo = cache(async (id: string) => {
  return prisma.video.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          _count: {
            select: {
              subscribers: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      videoTags: {
        include: {
          tag: true,
        },
      },
    },
  });
});

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: video.title,
    description: video.description || 'Watch this video on eddythedaddy',
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  // Deduplicated: same cache() call as generateMetadata — no extra DB hit
  const video = await getVideo(id);

  if (!video) {
    notFound();
  }

  const session = await auth();

  // Check if video is published or belongs to current user
  if (video.status !== 'PUBLISHED' && video.userId !== session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Video Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This video is still being processed or is not available.
          </p>
          <Link
            href="/"
            className="text-xred-600 hover:text-xred-700 font-medium"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Check Premium Access
  let isPremiumUser = false;
  if (session?.user?.id) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isPremium: true } });
      isPremiumUser = user?.isPremium || false;
  }

  if (video.isPremium && !isPremiumUser && video.userId !== session?.user?.id) {
     return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
           <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-lg shadow-xl overflow-hidden text-center">
              <div className="h-32 bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                 <span className="text-4xl">👑</span>
              </div>
              <div className="p-8">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium Content</h2>
                 <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This exclusive video is available only to premium subscribers. Upgrade now to watch instantly.
                 </p>
                 <Link href="/premium" className="block w-full py-3 px-4 rounded-lg shadow bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all">
                    Unlock Premium Access
                 </Link>
                 <Link href="/" className="block mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Return to Home
                 </Link>
              </div>
           </div>
        </div>
     );
  }

  // Parallelize Redis/engagement queries instead of sequential waterfall
  const [likeData, viewCount, subscriptionData, commentsResult] = await Promise.all([
    getLikeStatus(video.id),
    getViewCount(video.id),
    getSubscriptionStatus(video.userId),
    getComments({ videoId: video.id, parentId: null, limit: 10 }),
  ]);

  const { isLiked, likeCount } = likeData;
  const { isSubscribed, subscriberCount } = subscriptionData;
  const initialComments = commentsResult.success ? commentsResult.comments || [] : [];
  const initialNextCursor = commentsResult.success ? commentsResult.nextCursor || null : null;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <ViewTracker videoId={video.id} />
      
      {/* Top Banner Ad - Leaderboard */}
      {!isPremiumUser && (
        <div className="flex justify-center py-4 bg-gray-50 dark:bg-dark-950/50">
           <AdUnit 
             zoneId={adConfig.exoclick.footerZoneId} 
             width={728} 
             height={90} 
             className="shadow-sm"
             fallbackText="728x90 Top Banner"
           />
        </div>
      )}

      <div className="max-w-[1800px] mx-auto px-0 md:px-4 py-0 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-4">
             {/* 1. Title with View Number */}
             <div className="px-4 sm:px-0">
                <div className="flex flex-col gap-1 mb-2">
                   <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                      {video.title}
                      {video.isPremium && (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            PREMIUM
                         </span>
                      )}
                   </h1>
                   <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white mr-2">
                        {formatNumber(viewCount)} views
                      </span>
                   </div>
                </div>

                {/* 2. Tags Row (Button like, max 3) */}
                <div className="mb-4">
                   <VideoTags tags={video.videoTags.map(vt => vt.tag)} />
                </div>
             </div>

             {/* 3. Player */}
            <div className={`w-full ${!video.hlsUrl ? 'aspect-video bg-gray-900' : ''} sm:rounded-lg overflow-hidden relative z-10`}>
              {video.hlsUrl ? (
                <VideoPlayer 
                  hlsUrl={video.hlsUrl} 
                  thumbnailUrl={video.thumbnailUrl} 
                  title={video.title}
                  vastTagUrl={process.env.NEXT_PUBLIC_VAST_TAG_URL || ''} // VAST tag support
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <div className="text-center">
                      <p className="text-white mb-2">Processing Video...</p>
                      <p className="text-sm text-gray-400">Please check back later</p>
                   </div>
                </div>
              )}
            </div>
            
            {/* Ad Banner - Below Player (Mobile/Desktop) */}
            <div className="my-4 flex justify-center">
               <AdUnit 
                  zoneId={adConfig.exoclick.mobileZoneId} 
                  width={300} 
                  height={100}
                  className="rounded shadow-sm"
                  fallbackText="300x100 Premium Ad" 
               />
            </div>
            
            {/* 4. Single Row Actions (Subscribe + Like/Share/etc) */}
            <div className="px-4 sm:px-0 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-dark-800">
                <div className="flex items-center gap-4">
                   {/* User Profile */}
                   <Link href={`/profile/${video.user.username}`} className="flex-shrink-0">
                      {video.user.avatarUrl ? (
                         <img 
                            src={video.user.avatarUrl} 
                            alt={video.user.username} 
                            className="w-10 h-10 rounded-full object-cover"
                         />
                      ) : (
                         <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {video.user.username[0].toUpperCase()}
                         </div>
                      )}
                   </Link>
                   <div>
                      <Link 
                         href={`/profile/${video.user.username}`}
                         className="font-bold text-gray-900 dark:text-white hover:text-xred-600 dark:hover:text-xred-400 block"
                      >
                         {video.user.username}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                         {formatNumber(subscriberCount)} subscribers
                      </p>
                   </div>
                   {/* Subscribe Button */}
                   <div className="ml-2">
                     <SubscribeButton 
                         creatorId={video.userId}
                         initialIsSubscribed={isSubscribed}
                         initialSubscriberCount={subscriberCount}
                         showCount={false}
                     />
                   </div>
                </div>

                {/* Right Side Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                   <LikeButton 
                      videoId={video.id} 
                      initialLiked={isLiked} 
                      initialCount={likeCount} 
                   />
                   <ShareButton 
                      url={`https://www.eddythedaddy.com/video/${video.id}`} 
                      title={video.title} 
                   />
                   <a href="#comments" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 transition-colors whitespace-nowrap min-h-[44px]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      <span className="font-medium hidden sm:inline">Comment</span>
                   </a>
                   <ReportButton videoId={video.id} />
                </div>
            </div>

            {/* 5. Ads Section */}
            <div className="my-2 hidden md:flex justify-center">
                {!isPremiumUser && (
                   <AdUnit 
                      zoneId={adConfig.exoclick.footerZoneId} // Reusing horizontal zone
                      width={728} 
                      height={90} 
                      className="shadow-sm" 
                      fallbackText="728x90 Mid Banner"
                   />
                )}
            </div>
            
            {/* Description */}
            <div className="px-4 sm:px-0 bg-gray-50 dark:bg-dark-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                   {video.description || 'No description provided.'}
                </div>
            </div>

            {/* Related Videos Grid in Main Column (Now Full Width) */}
            <div className="px-4 sm:px-0 mt-8">
               <RelatedVideos videoId={video.id} />
            </div>

            {/* Comments Section */}
            <div id="comments" className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-800 px-4 sm:px-0">
                <CommentWrapper commentCount={video._count.comments}>
                  <CommentSection
                    videoId={video.id}
                    initialComments={initialComments}
                    initialNextCursor={initialNextCursor}
                  />
                </CommentWrapper>
            </div>
          </div>
          
          {/* Sidebar REMOVED as requested */}
        </div>
      </div>
    </div>
  );
}
