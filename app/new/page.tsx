import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import Link from 'next/link';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';
import { unstable_cache } from 'next/cache';

export const revalidate = 60;

export const metadata = {
  title: 'New Videos - eddythedaddy',
  description: 'Watch the latest uploaded videos on eddythedaddy.',
};

const VIDEOS_PER_PAGE = 36;

const getCachedNewVideos = unstable_cache(
  async (page: number) => {
    const [totalCount, videos] = await Promise.all([
      prisma.video.count({ where: { status: 'PUBLISHED' } }),
      prisma.video.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: VIDEOS_PER_PAGE,
        skip: (page - 1) * VIDEOS_PER_PAGE,
        include: { user: { select: { username: true, avatarUrl: true } } },
      }),
    ]);
    return { totalCount, videos };
  },
  ['new-videos'],
  { revalidate: 60, tags: ['videos'] }
);

export default async function NewVideosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const { totalCount, videos } = await getCachedNewVideos(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / VIDEOS_PER_PAGE));

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                New Videos
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-dark-800 px-2 py-1 rounded-full">
                    {totalCount} videos
                </span>
            </h1>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="mb-6 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Top Banner"
             />
          </div>

        {videos.length === 0 ? (
          <div className="text-center py-20">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No new videos
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            {page <= 1 ? (
              <span className="px-5 py-2.5 text-sm font-medium rounded-lg opacity-50 bg-gray-100 dark:bg-dark-800 text-gray-400 cursor-default">
                Previous
              </span>
            ) : (
              <Link
                href={`/new?page=${page - 1}`}
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-colors bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            {page >= totalPages ? (
              <span className="px-5 py-2.5 text-sm font-medium rounded-lg opacity-50 bg-gray-100 dark:bg-dark-800 text-gray-400 cursor-default">
                Next
              </span>
            ) : (
              <Link
                href={`/new?page=${page + 1}`}
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-colors bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"
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
