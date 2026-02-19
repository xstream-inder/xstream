import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VideoCard } from '@/components/video/video-card';
import Image from 'next/image';
import { formatNumber } from '@/lib/utils';

interface ModelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ModelPageProps) {
  const { slug } = await params;
  const model = await prisma.model.findUnique({
    where: { slug },
    select: { stageName: true, bio: true },
  });

  if (!model) {
    return { title: 'Model Not Found' };
  }

  return {
    title: `${model.stageName} - eddythedaddy`,
    description: model.bio || `Watch videos featuring ${model.stageName}`,
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params;

  const model = await prisma.model.findUnique({
    where: { slug },
    include: {
      videoModels: {
        where: {
          video: {
            status: 'PUBLISHED',
          },
        },
        include: {
          video: {
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
        orderBy: {
          video: {
            createdAt: 'desc',
          },
        },
      },
    },
  });

  if (!model) {
    notFound();
  }

  const videos = model.videoModels.map((vm) => vm.video);

  const calculateAge = (birthDate: Date | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(model.birthDate);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Model Profile Header */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-dark-700 flex-shrink-0">
              {model.avatarUrl ? (
                <Image
                  src={model.avatarUrl}
                  alt={model.stageName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {model.stageName}
                </h1>
                {model.isVerified && (
                  <svg
                    className="w-7 h-7 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {model.videoCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(model.viewsCount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                </div>
              </div>

              {/* Demographics */}
              <div className="flex flex-wrap gap-4 mb-4">
                {model.gender && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                    {model.gender.replace('_', ' ')}
                  </span>
                )}
                {age && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium rounded-full">
                    {age} years old
                  </span>
                )}
                {model.ethnicity && (
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 text-sm font-medium rounded-full">
                    {model.ethnicity}
                  </span>
                )}
              </div>

              {/* Bio */}
              {model.bio && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {model.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Videos ({videos.length})
          </h2>

          {videos.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos available</h3>
              <p className="text-gray-600 dark:text-gray-400">This model hasn&apos;t uploaded any videos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
