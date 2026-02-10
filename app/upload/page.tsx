import { prisma } from '@/lib/prisma';
import { VideoUploader } from '@/components/upload/video-uploader';
import { auth } from '@/lib/auth-helper';

export default async function UploadPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Fetch models, categories, and top tags for selection
  const [models, categories, tags] = await Promise.all([
    prisma.model.findMany({
      where: { isVerified: true },
      select: { id: true, stageName: true },
      orderBy: { stageName: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.tag.findMany({
      take: 50,
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upload Video
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Upload your video directly to Bunny Stream. Files are streamed directly to our CDN.
            </p>
          </div>
          
          <VideoUploader 
            models={models} 
            categories={categories} 
            availableTags={tags}
            isAdmin={isAdmin}
          />

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Upload Guidelines
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• All performers must be 18+ with valid ID verification</li>
              <li>• Maximum file size: Unlimited (resumable uploads)</li>
              <li>• Supported formats: MP4, AVI, MOV, MKV, WebM, and more</li>
              <li>• Your video will be automatically transcoded for optimal streaming</li>
              <li>• Processing time varies based on video length and resolution</li>
              <li>• Tag models and categories for better discoverability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
