'use client';

import { useState, useTransition } from 'react';
import { deleteVideo } from '@/server/actions/video';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ui/confirm-dialog';

export function DeleteVideoButton({ videoId }: { videoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Video',
      message: 'Are you sure you want to delete this video? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteVideo(videoId);
        router.refresh();
      } catch (err) {
        setError('Failed to delete video');
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
        title="Delete Video"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
