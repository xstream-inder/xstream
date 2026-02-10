import { getUserVideos } from '@/server/actions/video';
import { DeleteVideoButton } from '@/components/studio/delete-video-button';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Content Studio - XStream',
};

export default async function StudioPage() {
  const { videos } = await getUserVideos(1, 100); // Fetch first 100 for now

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Channel Content
          </h1>
          <Link
             href="/upload"
             className="px-4 py-2 bg-xred-600 text-white rounded-lg hover:bg-xred-700 transition-colors font-medium flex items-center gap-2"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
             Create
          </Link>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-dark-700">
          {videos.length === 0 ? (
            <div className="p-12 text-center">
               <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
               </div>
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content available</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">Upload videos to get started with your channel.</p>
               <Link
                 href="/upload"
                 className="text-xred-600 hover:text-xred-700 font-medium"
               >
                 Upload a video
               </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-dark-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-dark-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">Video</th>
                    <th className="px-6 py-4 font-medium">Visibility</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Views</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-14 bg-gray-200 dark:bg-dark-700 rounded relative overflow-hidden flex-shrink-0">
                             {video.thumbnailUrl && (
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                             )}
                          </div>
                          <div>
                            <Link 
                                href={`/video/${video.id}`} 
                                className="font-medium text-gray-900 dark:text-white hover:text-xred-600 line-clamp-1 mb-1"
                            >
                                {video.title}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {video.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${video.status === 'PUBLISHED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                         >
                            {video.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                         {new Date(video.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">
                         {video.viewsCount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Link
                              href={`/studio/edit/${video.id}`}
                              className="p-2 text-gray-500 hover:text-xred-600 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                              title="Edit details"
                           >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                           </Link>
                           <DeleteVideoButton videoId={video.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
