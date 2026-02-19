'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CATEGORIES = [
  { name: 'All', slug: 'all' },
  { name: 'Teens', slug: 'teen' },
  { name: 'MILF', slug: 'milf' },
  { name: 'Amateur', slug: 'amateur' },
  { name: 'Asian', slug: 'asian' },
  { name: 'Ebony', slug: 'ebony' },
  { name: 'Latina', slug: 'latina' },
  { name: 'Hentai', slug: 'hentai' },
  { name: 'VR', slug: 'vr' },
];

export function CategoryPills() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = 
              cat.slug === 'all' 
                ? pathname === '/' 
                : pathname === `/category/${cat.slug}`;
                
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}`}
                className={`
                  whitespace-nowrap rounded-full px-4 py-2 sm:py-1.5 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-xred-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'}
                `}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}