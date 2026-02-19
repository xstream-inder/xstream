export default function ModelLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header skeleton */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-48 h-48 rounded-lg bg-gray-200 dark:bg-dark-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
              <div className="flex gap-6">
                <div className="space-y-1">
                  <div className="h-7 w-12 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-7 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 w-20 bg-gray-200 dark:bg-dark-700 rounded-full animate-pulse" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Videos skeleton */}
        <div className="h-7 w-32 bg-gray-200 dark:bg-dark-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
