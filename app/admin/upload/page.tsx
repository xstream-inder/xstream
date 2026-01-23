import { AdminUploadForm } from '@/components/admin/upload-form';
import { auth } from '@/lib/auth-helper';
import { redirect } from 'next/navigation';

export default async function AdminUploadPage() {
  const session = await auth();
  
  // Protect Route (Assuming role 'ADMIN' exists in schema or logic)
  if (!session?.user) {
    redirect('/api/auth/signin');
  }
  
  // Note: Add role check here if your User model has roles
  // if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Upload</h1>
          <p className="text-gray-500">Fast upload with full metadata control.</p>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-800">
          <AdminUploadForm />
        </div>
      </div>
    </div>
  );
}