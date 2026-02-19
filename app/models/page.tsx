import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Models - eddythedaddy',
  description: 'Browse our collection of adult performers',
};

export default async function ModelsPage() {
  const models = await prisma.model.findMany({
    where: {
      isVerified: true,
      videoCount: {
        gt: 0,
      },
    },
    orderBy: {
      viewsCount: 'desc',
    },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Popular Models
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore profiles of {models.length} verified performers
          </p>
        </div>

        {/* Models Grid */}
        {models.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No models yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for verified performers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/model/${model.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Avatar */}
                  <div className="relative aspect-square bg-gray-200 dark:bg-dark-700">
                    {model.avatarUrl ? (
                      <Image
                        src={model.avatarUrl}
                        alt={model.stageName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400"
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

                    {/* Verified Badge */}
                    {model.isVerified && (
                      <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {model.stageName}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{model.videoCount} videos</span>
                      <span>{formatNumber(model.viewsCount)} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
