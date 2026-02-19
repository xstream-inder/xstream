import { searchVideos, getPopularSearches } from '@/server/actions/search';
import { VideoCard } from '@/components/video/video-card';
import Link from 'next/link';
import { Suspense } from 'react';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: 'relevance' | 'recent' | 'popular';
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  
  return {
    title: query ? `Search: ${query} - eddythedaddy` : 'Search - eddythedaddy',
    description: 'Search for videos on eddythedaddy',
  };
}

async function SearchResults({ query, sortBy }: { query: string; sortBy: 'relevance' | 'recent' | 'popular' }) {
  const { results, count, error } = await searchVideos(query, {
    sortBy,
    limit: 30,
  });

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 mb-4">
            <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try searching for something else or browse{' '}
          <Link href="/new" className="text-xred-600 hover:underline">
            new videos
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {results.map((video) => (
            <VideoCard key={video.id} video={video} />
        ))}
        </div>
        
        {/* Pagination hint: Just showing top results for now */}
        {count > 30 && (
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Showing top 30 results
            </div>
        )}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const sortBy = params.sort || 'relevance';

  const popularSearches = !query ? await getPopularSearches(15) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      
      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-3">
                        {query ? 'Search Results' : 'Search'}
                        {query && (
                             <span className="text-lg font-normal text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
                                &quot;{query}&quot;
                            </span>
                        )}
                     </h1>
                </div>
                
                {query && (
                    <div className="flex bg-gray-200 dark:bg-dark-800 p-1 rounded-lg self-start">
                        {[
                            { id: 'relevance', label: 'Relevance' },
                            { id: 'recent', label: 'Date' },
                            { id: 'popular', label: 'Views' },
                        ].map((tab) => {
                            const isActive = sortBy === tab.id;
                            return (
                                <Link
                                    key={tab.id}
                                    href={`/search?q=${encodeURIComponent(query)}&sort=${tab.id}`}
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
                )}
            </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
         {/* Top Ad */}
         <AdUnit 
                zoneId={adConfig.exoclick.footerZoneId}
                width={728}
                height={90}
                className="w-full max-w-[728px] mx-auto"
                fallbackText="Search Header Ad"
            />

        {/* Popular Searches (Zero Query State) */}
        {!query && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-xred-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Popular Searches
            </h2>
            
            {popularSearches.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {popularSearches.map((search) => (
                  <Link
                    key={search}
                    href={`/search?q=${encodeURIComponent(search)}`}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-xred-50 dark:hover:bg-xred-900/20 hover:text-xred-600 dark:hover:text-xred-400 transition-colors border border-gray-200 dark:border-dark-700 font-medium"
                  >
                    #{search}
                  </Link>
                ))}
              </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                     <p>Type in the search bar above to find videos.</p>
                </div>
            )}
            
            <div className="mt-12 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Or browse by:</h3>
                <div className="flex justify-center gap-4">
                     <Link href="/new" className="px-6 py-3 bg-xred-600 text-white rounded-lg hover:bg-xred-700 font-medium">Newest Videos</Link>
                     <Link href="/best" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Top Rated</Link>
                </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
            <Suspense fallback={
                <div className="flex justify-center py-20">
                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-xred-600"></div>
                </div>
            }>
              <SearchResults query={query} sortBy={sortBy} />
            </Suspense>
        )}
        
        <div className="mt-8 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Search Banner"
             />
         </div>
      </div>
    </div>
  );
}
