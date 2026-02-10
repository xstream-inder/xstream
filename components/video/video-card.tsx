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
    previewUrl?: string | null;
    resolutions?: string[];
    isPremium?: boolean;
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
    if (video.previewUrl) return video.previewUrl;
    // If we are here, we are hovering and haven't errored yet, so try the preview URL
    return `https://${BUNNY_PULL_ZONE}/${video.bunnyVideoId}/preview.webp`;
  };

  const getThumbnailUrl = () => {
    return video.thumbnailUrl || `https://${BUNNY_PULL_ZONE}/${video.bunnyVideoId}/thumbnail.jpg`;
  };

  const getVideoBadge = () => {
    if (video.resolutions && video.resolutions.length > 0) {
      if (video.resolutions.some(r => r.includes('4K') || r.includes('2160p'))) return '4K';
      if (video.resolutions.some(r => r.includes('2K') || r.includes('1440p'))) return '2K';
      if (video.resolutions.some(r => r.includes('1080p'))) return 'HD';
      if (video.resolutions.some(r => r.includes('720p'))) return 'HD';
    }
    // Fallback if resolutions array is empty but it's new content
    return 'HD'; 
  };
  
  const badge = getVideoBadge();

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
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          {video.isPremium && (
             <div className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-sm flex items-center">
               <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
               VIP
             </div>
          )}
          {badge && (
            <div className="px-1.5 py-0.5 bg-xred-500/90 text-white text-[10px] font-bold rounded uppercase tracking-wider">
              {badge}
            </div>
          )}
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
