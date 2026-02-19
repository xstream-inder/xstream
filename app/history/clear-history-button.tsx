'use client';

import { useTransition } from 'react';
import { clearHistory } from '@/server/actions/history';
import { useRouter } from 'next/navigation';

export function ClearHistoryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your entire watch history?')) {
      startTransition(async () => {
        await clearHistory();
        router.refresh();
      });
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={isPending}
      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? 'Clearing...' : 'Clear All History'}
    </button>
  );
}
