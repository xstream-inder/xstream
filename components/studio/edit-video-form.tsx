'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateVideo } from '@/server/actions/video';

interface VideoToEdit {
  id: string;
  title: string;
  description: string | null;
  orientation: 'STRAIGHT' | 'GAY' | 'LESBIAN' | 'TRANS' | null;
  isPremium: boolean;
  tags?: { id: string; name: string; slug: string }[];
}

export function EditVideoForm({ video }: { video: VideoToEdit }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [orientation, setOrientation] = useState(video.orientation || 'STRAIGHT');
  const [isPremium, setIsPremium] = useState(video.isPremium);
  const [tags, setTags] = useState(video.tags?.map(t => t.name).join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    startTransition(async () => {
      try {
        await updateVideo(video.id, {
          title,
          description,
          orientation,
          isPremium,
          tags: tagList,
        });
        router.push('/studio');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="orientation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category (Orientation)
        </label>
        <select
          id="orientation"
          value={orientation}
          onChange={(e) => setOrientation(e.target.value as any)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="STRAIGHT">Straight</option>
          <option value="GAY">Gay</option>
          <option value="LESBIAN">Lesbian</option>
          <option value="TRANS">Trans</option>
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (comma separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="teen, pov, outdoor"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="flex items-center">
        <input
          id="isPremium"
          type="checkbox"
          checked={isPremium}
          onChange={(e) => setIsPremium(e.target.checked)}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          Premium Content (Subscribers Only)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
