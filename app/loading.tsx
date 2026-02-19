export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 p-4">
       <div className="max-w-[1800px] mx-auto">
          {/* Header Skeleton */}
          <div className="flex gap-4 mb-6">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-dark-800 rounded-full animate-pulse" />
             ))}
          </div>

          <div className="h-32 w-full bg-gray-200 dark:bg-dark-800 rounded-lg animate-pulse mb-8" />
          
          <div className="h-8 w-48 bg-gray-200 dark:bg-dark-800 rounded mb-6 animate-pulse" />

          {/* Video Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                   <div className="aspect-video bg-gray-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                   <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-dark-800 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-dark-800 rounded w-1/2 animate-pulse" />
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
