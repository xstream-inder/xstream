'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface SearchResult {
  id: string;
  bunnyVideoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  viewsCount: number;
  createdAt: Date;
  user: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  count: number;
  error?: string;
}

/**
 * Search videos using full-text search with fuzzy matching
 * Supports typos and partial matches via pg_trgm
 */
export async function searchVideos(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'recent' | 'popular';
  }
): Promise<SearchResponse> {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        results: [],
        count: 0,
      };
    }

    const searchQuery = query.trim();
    const limit = options?.limit || 24;
    const offset = options?.offset || 0;
    const sortBy = options?.sortBy || 'relevance';

    // 1. Try advanced fuzzy search first (using pg_trgm)
    try {
      const fuzzyResults = await prisma.$queryRaw<Array<SearchResult & { relevance: number }>>`
        SELECT 
          v.id,
          v.bunny_video_id as "bunnyVideoId",
          v.title,
          v.description,
          v.thumbnail_url as "thumbnailUrl",
          v.duration,
          v.views_count as "viewsCount",
          v.created_at as "createdAt",
          json_build_object(
            'username', u.username,
            'avatarUrl', u.avatar_url
          ) as "user",
          GREATEST(
            similarity(v.title, ${searchQuery}),
            similarity(COALESCE(v.description, ''), ${searchQuery})
          ) as relevance
        FROM videos v
        INNER JOIN users u ON v.user_id = u.id
        WHERE 
          v.status = 'PUBLISHED'
          AND (
            v.title ILIKE ${`%${searchQuery}%`}
            OR v.description ILIKE ${`%${searchQuery}%`}
            OR EXISTS (
              SELECT 1 FROM video_tags vt
              JOIN tags t ON t.id = vt.tag_id
              WHERE vt.video_id = v.id AND t.name ILIKE ${`%${searchQuery}%`}
            )
            OR similarity(v.title, ${searchQuery}) > 0.1
          )
        ORDER BY 
          ${sortBy === 'relevance' ? Prisma.sql`relevance DESC, v.views_count DESC` : 
            sortBy === 'popular' ? Prisma.sql`v.views_count DESC` : 
            Prisma.sql`v.created_at DESC`}
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      if (fuzzyResults.length > 0) {
        return {
          success: true,
          results: fuzzyResults.map(({ relevance, ...result }) => result),
          count: fuzzyResults.length,
        };
      }
    } catch (error) {
       // Ignore fuzzy search error and fall back to basic
       // console.warn('Fuzzy search failed (likely missing pg_trgm):', error);
    }

    // 2. Fallback: Basic Prisma search
    const basicSearch = await prisma.video.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { videoTags: { some: { tag: { name: { contains: searchQuery, mode: 'insensitive' } } } } }
        ],
      },
      select: {
        id: true,
        bunnyVideoId: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        duration: true,
        viewsCount: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: getSortOrder(sortBy),
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      results: basicSearch,
      count: basicSearch.length,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      results: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Get popular search queries (for autocomplete/suggestions)
 */
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  try {
    // Get popular tags from the Tag table via video relationships 
    const popularTags = await prisma.tag.findMany({
      where: {
        videos: {
          some: {
            video: {
              status: 'PUBLISHED',
            },
          },
        },
      },
      select: {
        name: true,
        _count: {
          select: { videos: true },
        },
      },
      orderBy: {
        videos: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return popularTags.map((tag) => tag.name);
  } catch (error) {
    console.error('Failed to get popular searches:', error);
    return [];
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  try {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    const videos = await prisma.video.findMany({
      where: {
        status: 'PUBLISHED',
        title: {
          contains: partialQuery,
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
      },
      take: limit,
      orderBy: {
        viewsCount: 'desc',
      },
    });

    return videos.map((v) => v.title);
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return [];
  }
}

function getSortOrder(sortBy: 'relevance' | 'recent' | 'popular') {
  switch (sortBy) {
    case 'popular':
      return { viewsCount: 'desc' as const };
    case 'recent':
      return { createdAt: 'desc' as const };
    case 'relevance':
    default:
      return [
        { viewsCount: 'desc' as const },
        { createdAt: 'desc' as const },
      ];
  }
}
