export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-gray-200 dark:bg-dark-800 rounded animate-pulse mb-8" />
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 space-y-3">
              <div className="h-4 w-20 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
          <div className="h-12 bg-gray-100 dark:bg-dark-700 animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-dark-700">
              <div className="w-24 h-14 bg-gray-200 dark:bg-dark-700 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/3 animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
