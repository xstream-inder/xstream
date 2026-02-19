import { getAdminVideos } from '@/server/actions/video';
import { VideoList } from '@/components/admin/video-list';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helper';

interface AdminVideosPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminVideosPage(props: AdminVideosPageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const page = Number(searchParams.page) || 1;
  const limit = 20;

  // Fetch initial data
  const { videos, total, pages } = await getAdminVideos(page, limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Videos</h1>
          <div className="text-gray-500">
            Page {page} of {pages} (Total: {total})
          </div>
        </div>
        
        <VideoList 
          initialVideos={videos}
          currentPage={page}
          totalPages={pages}
        />
      </div>
    </div>
  );
}
