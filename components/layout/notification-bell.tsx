'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } from '@/server/actions/notifications';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll for unread count
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchCount = () => {
      getUnreadNotificationCount().then(setUnreadCount).catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [session?.user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    if (!isOpen) {
      // Fetch notifications when opening
      const result = await getNotifications(1, 10);
      setNotifications(result.notifications as Notification[]);
      setUnreadCount(result.unreadCount);
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      startTransition(async () => {
        await markNotificationRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      });
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-800"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-xred-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-xred-600 hover:text-xred-700 font-medium disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => {
                const content = (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-xred-50/50 dark:bg-xred-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        !notification.isRead ? 'bg-xred-600' : 'bg-transparent'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                if (notification.linkUrl) {
                  return (
                    <Link key={notification.id} href={notification.linkUrl}>
                      {content}
                    </Link>
                  );
                }
                return content;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
