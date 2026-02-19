import { auth } from '@/lib/auth-helper';
import { redirect } from 'next/navigation';
import { getReports, getReportCounts } from '@/server/actions/reporting';
import { ReportList } from './report-list';

export const metadata = {
  title: 'Content Reports - Admin',
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const params = await searchParams;
  const status = params.status || 'PENDING';
  const page = parseInt(params.page || '1', 10);

  const [{ reports, total, pages }, counts] = await Promise.all([
    getReports(page, 20, status),
    getReportCounts(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Content Reports
        </h1>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { key: 'PENDING', label: 'Pending', count: counts.pending },
            { key: 'REVIEWED', label: 'Reviewed', count: counts.reviewed },
            { key: 'ACTIONED', label: 'Actioned', count: counts.actioned },
            { key: 'DISMISSED', label: 'Dismissed', count: counts.dismissed },
            { key: 'ALL', label: 'All', count: counts.total },
          ].map((tab) => (
            <a
              key={tab.key}
              href={`/admin/reports?status=${tab.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === tab.key
                  ? 'bg-xred-600 text-white'
                  : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              {tab.label} ({tab.count})
            </a>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {status.toLowerCase()} reports
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {status === 'PENDING'
                ? 'Great! No reports need review.'
                : `No reports with ${status.toLowerCase()} status.`}
            </p>
          </div>
        ) : (
          <>
            <ReportList reports={reports} />

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/admin/reports?status=${status}&page=${p}`}
                    className={`px-3 py-1 rounded text-sm ${
                      p === page
                        ? 'bg-xred-600 text-white'
                        : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
