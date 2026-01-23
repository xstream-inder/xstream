import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';

interface RelatedVideosProps {
  videoId: string;
}

export async function RelatedVideos({ videoId }: RelatedVideosProps) {
  // 1. Get current video's category IDs
  const currentVideo = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      videoCategories: {
        select: { categoryId: true }
      }
    }
  });

  const categoryIds = currentVideo?.videoCategories.map(vc => vc.categoryId) || [];

  // 2. Fetch related
  const relatedVideos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: videoId }, // Exclude current
      videoCategories: {
        some: {
          categoryId: { in: categoryIds }
        }
      }
    },
    orderBy: {
      viewsCount: 'desc' // Sort by popularity
    },
    take: 8,
    include: {
      user: {
        select: { username: true, avatarUrl: true } // Added avatarUrl to match what VideoCard might expect or ignore
      }
    }
  });

  if (relatedVideos.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">
        Related Videos
      </h3>
      
      {/* 
        Layout Grid: 
        Mobile: 1 column (list below player) or 2 columns
        Desktop: 1 column (vertical sidebar) 
        This is typically handled by the parent grid in page.tsx. 
        Here we define the internal structure. 
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
        {relatedVideos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={{
                ...video,
                thumbnailUrl: video.thumbnailUrl || null,
                duration: video.duration || null,
                // Pass minimal required fields. VideoCard interface implementation expects bunyVideoId, title, etc. which are in 'video'
            }} 
          />
        ))}
      </div>
    </div>
  );
}