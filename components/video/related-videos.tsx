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
      tags: true, 
      userId: true,
      videoCategories: {
        select: { categoryId: true }
      }
    }
  });

  const categoryIds = currentVideo?.videoCategories.map(vc => vc.categoryId) || [];
  const tags = currentVideo?.tags || [];
  const authorId = currentVideo?.userId;

  // 2. Fetch related
  // Priority: 
  // 1. Same Author + Same Tags/Category
  // 2. Same Tags
  // 3. Same Category
  // We can simulate this with a single query sorting by multiple criteria or score, 
  // but for simplicity in Prisma, we'll fetch broad matches and sort by views/recency.
  const relatedVideos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: videoId }, // Exclude current
      OR: [
        { videoCategories: { some: { categoryId: { in: categoryIds } } } },
        { tags: { hasSome: tags } },
        { userId: authorId }
      ]
    },
    orderBy: [
       { viewsCount: 'desc' },
       { createdAt: 'desc' }
    ],
    take: 24, // Increased to support larger grid
    include: {
      user: {
        select: { username: true, avatarUrl: true } 
      }
    }
  });

  if (relatedVideos.length === 0) return null;

  // Helper to chunk array
  const chunkedVideos = [];
  const chunkSize = 8;
  for (let i = 0; i < relatedVideos.length; i += chunkSize) {
    chunkedVideos.push(relatedVideos.slice(i, i + chunkSize));
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">
        You might also like
      </h3>
      
      <div className="flex flex-col gap-6">
        {chunkedVideos.map((chunk, chunkIndex) => (
           <div key={chunkIndex} className="contents">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {chunk.map((video) => (
                     <VideoCard 
                        key={video.id} 
                        video={{
                           ...video,
                           thumbnailUrl: video.thumbnailUrl || null,
                           duration: video.duration || null,
                        }} 
                     />
                  ))}
                  
                  {/* Premium/Ad Injection Logic */}
                  {/* If this is a full chunk of 8 (or we want to force it even on partials?), inject ads */}
                  {/* User requirement: "after each 8 video there should be video ads or 2 premium videos" */}
                  {/* We can just render the extra items right here in the grid if we want them to flow, 
                      BUT if we want them to break the row or specific spots, we need to be careful.
                      If "6 video in row", 8 videos is 1 row + 2 videos. 
                      Adding 2 premium videos makes 10 videos -> 1 row + 4 videos.
                      This implies flow layout.
                  */}
              </div>
              
              {/* Injecting content BETWEEN chunks (Conceptually "after 8 videos") */}
              {/* If we want them IN the flow, we should have added them to the array. 
                  If we want them as a separate block (like "Sponsored"), we do it here.
                  "there should be video ads or 2 premium videos".
                  Let's insert a small banner or premium teaser block after every chunk of 8.
              */}
              <div className="col-span-full py-4 text-center bg-gray-100 dark:bg-dark-800 rounded-lg my-2">
                  <p className="text-gray-500 font-medium text-sm">Sponsored Content / Premium Suggestions</p>
                  {/* Placeholder for 2 premium videos or ads */}
                  <div className="flex justify-center gap-4 mt-2">
                      <div className="w-[300px] h-[169px] bg-black/10 dark:bg-white/5 rounded flex items-center justify-center">
                          <span className="text-xs">Premium Recommendation 1</span>
                      </div>
                      <div className="w-[300px] h-[169px] bg-black/10 dark:bg-white/5 rounded flex items-center justify-center">
                          <span className="text-xs">Premium Recommendation 2</span>
                      </div>
                  </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}