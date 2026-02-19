'use client';

import { useRouter } from 'next/navigation';

export function SortSelector({ currentSort, query }: { currentSort: string; query: string }) {
  const router = useRouter();
  
  if (!query) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    router.push(`/search?q=${encodeURIComponent(query)}&sort=${sort}`);
  };

  return (
    <div className="flex items-center space-x-2 text-sm z-10 relative">
      <label htmlFor="sort-select" className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Sort by:</label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className="block min-w-[120px] rounded-lg border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-xred-500 sm:text-sm py-2 pl-3 pr-10"
      >
        <option value="relevance">Relevance</option>
        <option value="recent">Upload Date</option>
        <option value="popular">View Count</option>
      </select>
    </div>
  );
}
