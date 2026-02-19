'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useSession } from 'next-auth/react';
import { toggleSubscription } from '@/server/actions/engagement';

interface SubscribeButtonProps {
  creatorId: string;
  initialIsSubscribed: boolean;
  initialSubscriberCount: number;
  className?: string;
  showCount?: boolean;
}

export function SubscribeButton({
  creatorId,
  initialIsSubscribed,
  initialSubscriberCount,
  className = '',
  showCount = true,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { openModal } = useAuthModal();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [count, setCount] = useState(initialSubscriberCount);
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = async () => {
    if (!session) {
      openModal('signin');
      return;
    }

    // Optimistic update
    const previousState = isSubscribed;
    const previousCount = count;
    
    setIsSubscribed(!previousState);
    setCount(previousState ? count - 1 : count + 1);

    startTransition(async () => {
      try {
        const result = await toggleSubscription(creatorId);

        if (result.success) {
          setIsSubscribed(result.isSubscribed);
          setCount(result.subscriberCount);
          router.refresh();
        } else {
          // Revert on failure
          setIsSubscribed(previousState);
          setCount(previousCount);
          if (result.error === 'Authentication required') {
            openModal('signin');
          }
        }
      } catch (error) {
        setIsSubscribed(previousState);
        setCount(previousCount);
        console.error('Subscription error:', error);
      }
    });
  };

  // Don't show subscribe button for own profile
  if (session?.user?.id === creatorId) {
    return null;
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isPending}
      className={`
        px-3 sm:px-4 py-2 rounded-full font-medium text-sm transition-all min-h-[44px]
        ${isSubscribed
          ? 'bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-600'
          : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
        }
        ${isPending ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
    >
      <span className="flex items-center gap-2">
        {isSubscribed ? 'Subscribed' : 'Subscribe'}
        {showCount && (
            <span className="text-xs opacity-80 bg-black/10 px-1.5 py-0.5 rounded-full">
                {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(count)}
            </span>
        )}
      </span>
    </button>
  );
}
