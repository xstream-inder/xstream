import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import { CategoryPills } from '@/components/layout/category-pills';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';
import Link from 'next/link';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

// Configuration for ad injection positions
const AD_POSITIONS = {
   LEADERBOARD: 7, // 8th position (index 7)
   NATIVE: 19      // 20th position (index 19)
};

import { SortSelector } from '@/components/search/sort-selector';

const VIDEOS_PER_PAGE = 40;

export default async function HomePage(props: { searchParams: Promise<{ sort?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'recent';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  // Get total count for pagination
  const totalCount = await prisma.video.count({
    where: { status: 'PUBLISHED' },
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / VIDEOS_PER_PAGE));

  // Fetch published videos with creator info
  const videos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      user: {
        select: {
          username: true,
          avatarUrl: true, 
        },
      },
    },
    orderBy: sort === 'popular' 
      ? { viewsCount: 'desc' }
      : { createdAt: 'desc' },
    take: VIDEOS_PER_PAGE,
    skip: (page - 1) * VIDEOS_PER_PAGE,
  });

  // Helper to inject ads into the grid
  const renderVideoGrid = () => {
    const items: ReactNode[] = [];
    videos.forEach((video, index) => {
      items.push(
        <VideoCard 
          key={video.id} 
          video={{
             ...video,
             thumbnailUrl: video.thumbnailUrl || null,
             duration: video.duration || null,
             orientation: video.orientation || null,
             isPremium: video.isPremium
          }} 
        />
      );

      // Inject Leaderboard after 8th video (approx 2 rows)
      if (index === AD_POSITIONS.LEADERBOARD) {
        items.push(
          <div key="ad-leaderboard-1" className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-center py-4 bg-gray-50 dark:bg-dark-950/50 rounded-lg">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Home Banner"
             />
          </div>
        );
      }
      
      // Inject Native/Rectangle ad after 20th video
       if (index === AD_POSITIONS.NATIVE) {
        items.push(
          <div key="ad-native-1" className="col-span-1 min-h-[200px] flex items-center justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.sidebarZoneId} 
               width={300} 
               height={250} 
               className="shadow-sm"
               fallbackText="300x250 Native Ad"
             />
          </div>
        );
      }
    });
    return items;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      
      {/* Sticky Category Helper */}
      <CategoryPills />
      
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 py-4">
        {/* Top Ad */}
        <div className="mb-6 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Top Banner"
             />
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">
            {sort === 'popular' ? 'Trending Now' : 'Recommended Videos'}
          </h1>
          
          <div className="flex items-center gap-2">
            <Link
               href="/"
               className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${sort !== 'popular' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-gray-300 dark:hover:bg-dark-700'}`}
            >
               Newest
            </Link>
            <Link
               href="/?sort=popular"
               className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${sort === 'popular' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-gray-300 dark:hover:bg-dark-700'}`}
            >
               Popular
            </Link>
          </div>
        </div>

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
            {renderVideoGrid()}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            {page <= 1 ? (
              <span className="px-5 py-2.5 text-sm font-medium rounded-full opacity-50 bg-gray-100 dark:bg-dark-800 text-gray-400 cursor-default">
                Previous
              </span>
            ) : (
              <Link
                href={`/?sort=${sort}&page=${page - 1}`}
                className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-700"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            {page >= totalPages ? (
              <span className="px-5 py-2.5 text-sm font-medium rounded-full opacity-50 bg-gray-100 dark:bg-dark-800 text-gray-400 cursor-default">
                Next
              </span>
            ) : (
              <Link
                href={`/?sort=${sort}&page=${page + 1}`}
                className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-700"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
