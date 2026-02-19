export default function TagLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
          <div className="h-8 w-40 bg-gray-200 dark:bg-dark-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-dark-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto px-4 py-6">
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
