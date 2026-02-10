'use client';

import Link from 'next/link';
import { useState } from 'react';

interface VideoTagsProps {
  tags: { id: string; name: string; slug: string }[];
}

export function VideoTags({ tags }: VideoTagsProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!tags || tags.length === 0) return null;

  const visibleTags = showAll ? tags : tags.slice(0, 3);
  const hasMore = tags.length > 3;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {visibleTags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tag/${tag.slug}`}
          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-dark-800 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
        >
          #{tag.name}
        </Link>
      ))}
      
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Show all tags"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}
