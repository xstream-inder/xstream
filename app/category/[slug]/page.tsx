import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VideoCard } from '@/components/video/video-card';
import Link from 'next/link';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';
import { formatNumber } from '@/lib/utils';
import { cache } from 'react';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

// React cache() deduplicates between generateMetadata and page render
const getCategory = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
  });
});

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${category.name} Videos - eddythedaddy`,
    description: category.description || `Watch ${category.name} videos`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const validSorts = ['recent', 'popular', 'top'];
  const currentSort = validSorts.includes(sort || '') ? sort : 'recent';

  let orderBy: any = { video: { createdAt: 'desc' } };
  
  if (currentSort === 'popular') {
    orderBy = { video: { viewsCount: 'desc' } };
  } else if (currentSort === 'top') {
    orderBy = { video: { likesCount: 'desc' } };
  }

  // Deduplicated: getCategory uses same cache() as generateMetadata
  const [category, categoryVideos] = await Promise.all([
    getCategory(slug),
    prisma.videoCategory.findMany({
      where: {
        category: { slug },
        video: { status: 'PUBLISHED' },
      },
      include: {
        video: {
          include: {
            user: { select: { username: true, avatarUrl: true } },
          },
        },
      },
      orderBy,
      take: 40,
    }),
  ]);

  if (!category) {
    notFound();
  }

  const videos = categoryVideos.map((vc) => vc.video);

  const tabs = [
    { id: 'recent', label: 'Newest' },
    { id: 'popular', label: 'Most Viewed' },
    { id: 'top', label: 'Top Rated' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                        {category.name}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-dark-800 px-2 py-1 rounded-full">
                           {formatNumber(category.videoCount)}
                        </span>
                     </h1>
                     {category.description && (
                       <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl text-sm">
                         {category.description}
                       </p>
                     )}
                </div>
                
                {/* Sort Tabs */}
                <div className="flex bg-gray-200 dark:bg-dark-800 p-1 rounded-lg self-start">
                    {tabs.map((tab) => {
                        const isActive = currentSort === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={`/category/${slug}?sort=${tab.id}`}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                    isActive 
                                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' 
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
          {/* Ad Slot */}
          <div className="mb-6 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Top Banner"
             />
          </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No videos yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Check back soon for new content in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
        
         <div className="mt-8 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Bottom Banner"
             />
         </div>
      </div>
    </div>
  );
}
