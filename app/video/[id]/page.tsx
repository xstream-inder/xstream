import { prisma } from '@/lib/prisma';
import { VideoPlayer } from '@/components/video/video-player';
import { LikeButton } from '@/components/video/like-button';
import { ViewTracker } from '@/components/video/view-tracker';
import CommentSection from '@/components/comments/comment-section';
import { RelatedVideos } from '@/components/video/related-videos';
import { getLikeStatus } from '@/server/actions/engagement';
import { getViewCount } from '@/server/actions/view';
import { getComments } from '@/server/actions/comment';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth-helper';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: video.title,
    description: video.description || 'Watch this video on XStream',
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const session = await auth();

  // Fetch video with creator info
  const video = await prisma.video.findUnique({
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
    },
  });

  if (!video) {
    notFound();
  }

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

  // Fetch like status and view count from Redis
  const { isLiked, likeCount } = await getLikeStatus(video.id);
  const viewCount = await getViewCount(video.id);

  // Fetch initial comments (top-level only, 10 at a time)
  const commentsResult = await getComments({
    videoId: video.id,
    parentId: null,
    limit: 10,
  });

  const initialComments = commentsResult.success ? commentsResult.comments || [] : [];
  const initialNextCursor = commentsResult.success ? commentsResult.nextCursor || null : null;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* View Tracker - fires after 3 seconds */}
      <ViewTracker videoId={video.id} />
      
      <div className="max-w-[1800px] mx-auto px-0 md:px-4 py-0 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content: Player + Info (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Player Container */}
            <div className={`w-full ${!video.hlsUrl ? 'aspect-video bg-gray-900' : ''} sm:rounded-lg overflow-hidden relative z-10`}>
              {video.hlsUrl ? (
                <VideoPlayer 
                  hlsUrl={video.hlsUrl} 
                  thumbnailUrl={video.thumbnailUrl} 
                  title={video.title}
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

            {/* Video Info */}
            <div className="px-4 sm:px-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {video.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-800 gap-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white mr-2">
                    {formatNumber(viewCount)} views
                  </span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <LikeButton 
                    videoId={video.id} 
                    initialLiked={isLiked} 
                    initialCount={likeCount} 
                  />
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 transition-colors">
                     <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>

              {/* Creator Info & Description */}
              <div className="py-4 flex gap-4">
                <Link href={`/profile/${video.user.username}`} className="flex-shrink-0">
                  {video.user.avatarUrl ? (
                    <img 
                      src={video.user.avatarUrl} 
                      alt={video.user.username} 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {video.user.username[0].toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/profile/${video.user.username}`}
                    className="font-bold text-gray-900 dark:text-white hover:text-xred-600 dark:hover:text-xred-400 block"
                  >
                    {video.user.username}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(video.user._count.subscribers)} subscribers
                  </p>
                  
                  {video.description && (
                    <div className="mt-4 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {video.description}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 self-start">
                   <button className="px-6 py-2 bg-xred-600 text-white font-medium rounded-full hover:bg-xred-700 transition-colors shadow-sm">
                     Subscribe
                   </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-800">
                <CommentSection
                  videoId={video.id}
                  initialComments={initialComments}
                  initialNextCursor={initialNextCursor}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: Related Videos & Ads (3 cols) */}
          <div className="lg:col-span-3">
             <div className="px-4 sm:px-0">
                <RelatedVideos videoId={video.id} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
