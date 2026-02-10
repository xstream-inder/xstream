import Link from 'next/link';
 
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-xred-600 dark:text-xred-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        We couldn't find the page you were looking for. It might have been removed, renamed, or is currently unavailable.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-xred-600 text-white font-medium rounded-lg hover:bg-xred-700 transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
