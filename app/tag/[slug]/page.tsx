import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import { notFound } from 'next/navigation';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `${tag.name} Videos - eddythedaddy`,
    description: `Watch popular ${tag.name} videos on eddythedaddy.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  // Fetch Tag and its videos
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      videos: {
        include: {
          video: {
            include: {
              user: {
                 select: {
                    username: true,
                    avatarUrl: true
                 }
              }
            }
          }
        },
        orderBy: {
            video: {
                viewsCount: 'desc'
            }
        },
        take: 32 // Limit to 32 videos for now
      }
    }
  });

  if (!tag) {
    notFound();
  }

  // Extract videos from the relation
  const videos = tag.videos.map(vt => vt.video).filter(v => v.status === 'PUBLISHED');

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                #{tag.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
                {videos.length} videos found
            </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
          {/* Ad Slot */}
          <div className="mb-8 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Tag Header"
             />
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos found</h3>
                <p className="text-gray-600 dark:text-gray-400">No videos have been tagged with this yet.</p>
            </div>
          )}
      </div>
    </div>
  );
}
