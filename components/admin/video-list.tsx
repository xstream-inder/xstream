'use client';

import { useState, useEffect } from 'react';
import { updateVideoStatus, deleteVideo } from '@/server/actions/video';
import Link from 'next/link';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  user: {
    username: string;
    email: string; // Assuming email is available on user object based on previous context
  };
}

interface VideoListProps {
  initialVideos: Video[];
  currentPage: number;
  totalPages: number;
}

export function VideoList({ initialVideos, currentPage, totalPages }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  const handleStatusChange = async (videoId: string, newStatus: string) => {
    setLoading(videoId);
    setStatusError(null);
    try {
      await updateVideoStatus(videoId, newStatus);
      setVideos(videos.map(v => v.id === videoId ? { ...v, status: newStatus } : v));
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatusError('Failed to update status');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (videoId: string) => {
    const confirmed = await confirm({
      title: 'Delete Video',
      message: 'Are you sure you want to delete this video? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    
    setLoading(videoId);
    setStatusError(null);
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (error) {
      console.error('Failed to delete video:', error);
      setStatusError('Failed to delete video');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {statusError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>{statusError}</span>
          <button onClick={() => setStatusError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      <div className="overflow-x-auto bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploader</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate" title={video.title}>{video.title}</div>
                  <div className="text-xs text-gray-500">{video.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{video.user.username}</div>
                  <div className="text-xs text-gray-500">{video.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${video.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      video.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {video.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(video.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    disabled={loading === video.id}
                    onClick={() => handleStatusChange(video.id, video.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED')}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                  >
                    {video.status === 'PUBLISHED' ? 'Hide' : 'Publish'}
                  </button>
                  <button 
                    disabled={loading === video.id}
                    onClick={() => handleDelete(video.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <Link
            href={`/admin/videos?page=${currentPage - 1}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 ${
              currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/admin/videos?page=${currentPage + 1}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 ${
              currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
