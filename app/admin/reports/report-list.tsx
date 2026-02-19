'use client';

import { useState } from 'react';
import { updateReportStatus } from '@/server/actions/reporting';
import Link from 'next/link';

type Report = {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  video: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    status: string;
    user: { username: string };
  };
  user: { username: string; email: string } | null;
  reviewer: { username: string } | null;
};

export function ReportList({ reports }: { reports: Report[] }) {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    try {
      await updateReportStatus(report.id, status, adminNotes);
    } catch (error) {
      console.error('Failed to update report:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ACTIONED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    DISMISSED: 'bg-gray-100 text-gray-800 dark:bg-dark-900/30 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            {report.video.thumbnailUrl && (
              <img
                src={report.video.thumbnailUrl}
                alt=""
                className="w-20 h-12 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {report.video.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reported by {report.user?.username || 'Anonymous'} &middot;{' '}
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {report.reason}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[report.status] || ''
              }`}
            >
              {report.status}
            </span>
            <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Description */}
          {report.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {report.description}
              </p>
            </div>
          )}

          {/* Video info */}
          <div className="flex gap-4">
            <Link
              href={`/video/${report.video.id}`}
              target="_blank"
              className="text-sm text-xred-500 hover:underline"
            >
              View Video →
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Uploader: {report.video.user.username}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Video Status: {report.video.status}
            </span>
          </div>

          {/* Reviewer info */}
          {report.reviewer && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reviewed by {report.reviewer.username} on{' '}
              {report.reviewedAt
                ? new Date(report.reviewedAt).toLocaleDateString()
                : ''}
            </p>
          )}

          {/* Admin notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-xred-500 focus:border-transparent"
              rows={2}
              placeholder="Add notes about this report..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {report.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('ACTIONED')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                >
                  Take Action
                </button>
                <button
                  onClick={() => handleStatusUpdate('REVIEWED')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-xred-600 hover:bg-xred-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleStatusUpdate('DISMISSED')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
            {report.status !== 'PENDING' && (
              <button
                onClick={() => handleStatusUpdate('PENDING')}
                disabled={isUpdating}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
