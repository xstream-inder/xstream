export default function VideoLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="max-w-[1800px] mx-auto px-0 md:px-4 py-0 md:py-6">
        <div className="space-y-4">
          {/* Title skeleton */}
          <div className="px-4 sm:px-0">
            <div className="h-7 w-3/4 bg-gray-200 dark:bg-dark-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-dark-800 rounded animate-pulse mb-4" />
            {/* Tags skeleton */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 bg-gray-200 dark:bg-dark-800 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Player skeleton */}
          <div className="w-full aspect-video bg-gray-900 sm:rounded-lg animate-pulse flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Actions skeleton */}
          <div className="px-4 sm:px-0 py-3 flex items-center justify-between border-b border-gray-200 dark:border-dark-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-800 animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-dark-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-dark-800 rounded animate-pulse" />
              </div>
              <div className="h-9 w-24 bg-gray-200 dark:bg-dark-800 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-20 bg-gray-200 dark:bg-dark-800 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Description skeleton */}
          <div className="px-4 sm:px-0 bg-gray-50 dark:bg-dark-800/50 rounded-lg p-4 space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-dark-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-dark-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-dark-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
