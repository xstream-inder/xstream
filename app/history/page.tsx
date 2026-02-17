import { getWatchHistory, clearHistory } from '@/server/actions/history';
import { VideoCard } from '@/components/video/video-card';
import { auth } from '@/lib/auth-helper';
import { redirect } from 'next/navigation';
import { ClearHistoryButton } from './clear-history-button';

export const metadata = {
  title: 'Watch History - eddythedaddy',
};

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/history');
  }

  const { history } = await getWatchHistory(1, 40);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Watch History
          </h1>
          {history.length > 0 && <ClearHistoryButton />}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🕰️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No watch history yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Videos you watch will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item, index) => (
              <div key={`${item.video.id}-${index}`} className="relative group">
                {/* 
                  Passing the video object. 
                  VideoCard expects `id`, `title`, `thumbnailUrl`, `user`, etc. 
                  We mapped it in the server action. 
                */}
                <VideoCard video={item.video as any} /> 
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 px-1">
                   Watched on {new Date(item.viewedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
