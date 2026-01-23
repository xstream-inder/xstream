'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VideoCardProps {
  video: {
    id: string;
    bunnyVideoId: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    viewsCount: number;
    createdAt: Date | string;
    orientation?: string | null;
    user: {
      username: string;
      avatarUrl: string | null;
    };
  };
}

const BUNNY_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE || 'vz-xxxxx.b-cdn.net';

export function VideoCard({ video }: VideoCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (dateInput: Date | string): string => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  // Generate preview URL from Bunny CDN
  const getPreviewUrl = () => {
    // If we are here, we are hovering and haven't errored yet, so try the preview URL
    return `https://${BUNNY_PULL_ZONE}/${video.bunnyVideoId}/preview.webp`;
  };

  const getThumbnailUrl = () => {
    return video.thumbnailUrl || `https://${BUNNY_PULL_ZONE}/${video.bunnyVideoId}/thumbnail.jpg`;
  };

  return (
    <Link 
      href={`/video/${video.id}`}
      className="group block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-800">
        {/* Image / Preview */}
        {isHovering && !previewError ? (
          <Image
            src={getPreviewUrl()}
            alt={video.title}
            fill
            className="object-cover"
            onError={() => setPreviewError(true)}
            unoptimized
          />
        ) : (
          <Image
            src={getThumbnailUrl()}
            alt={video.title}
            fill
            className="object-cover"
            unoptimized
          />
        )}

        {/* Quality Badge (Top Right) */}
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-xred-500/90 text-white text-[10px] font-bold rounded uppercase tracking-wider">
          HD
        </div>

        {/* Duration Badge (Bottom Right) */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-xred-600 dark:group-hover:text-xred-500 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
          <span>{formatViews(video.viewsCount)} views</span>
          <span>•</span>
          <span>{formatTimeAgo(video.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
