'use client';

import { useState, useTransition } from 'react';
import { toggleLike } from '@/server/actions/engagement';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

interface LikeButtonProps {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({
  videoId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = async () => {
    // Optimistic update
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newLiked);
    setLikeCount(newCount);

    startTransition(async () => {
      const result = await toggleLike(videoId);

      if (result.success) {
        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);
      } else {
        // Revert on error
        setIsLiked(initialLiked);
        setLikeCount(initialCount);
        
        if (result.error === 'Authentication required') {
          openModal('signin');
        } else {
          alert(result.error || 'Failed to like video');
        }
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isLiked
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg
        className="w-5 h-5"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{likeCount.toLocaleString()}</span>
    </button>
  );
}
