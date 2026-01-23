import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import { CategoryPills } from '@/components/layout/category-pills';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch published videos with creator info
  const videos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      user: {
        select: {
          username: true,
          // avatarUrl is currently nullable, but needed for VideoCard
          avatarUrl: true, 
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 40, // Increase limit for high density grid
  });

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      
      {/* Sticky Category Helper */}
      <CategoryPills />

      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 py-4">
        {/* Header - Hidden on mobile if redundant, or minimal */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Recomended Videos
          </h1>
        </div>

        {/* Video Grid - Xhamster Lite Style (2 cols mobile, 4-5 cols desktop) */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No videos yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to share content with the community!
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center px-6 py-3 bg-xred-600 text-white font-medium rounded-lg hover:bg-xred-700 transition-colors"
            >
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {videos.map((video) => (
              <VideoCard 
                key={video.id} 
                video={{
                   ...video,
                   // Ensure types match what VideoCard expects
                   thumbnailUrl: video.thumbnailUrl || null,
                   duration: video.duration || null,
                   orientation: (video.orientation as any) || null
                }} 
              />
            ))}
          </div>
        )}

        {/* Load More/Pagination */}
        {videos.length >= 40 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-2.5 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-200 font-medium rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors text-sm">
              Show more videos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
