import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { EditVideoForm } from '@/components/studio/edit-video-form';

interface EditVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      orientation: true,
      isPremium: true,
      userId: true,
      videoTags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!video) {
    notFound();
  }

  // Ensure user owns the video or is admin
  if (video.userId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/studio');
  }

  // Flatten the tags structure for the form
  const formattedVideo = {
    ...video,
    tags: video.videoTags.map(vt => vt.tag),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Video</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your video details and visibility
        </p>
      </div>

      <EditVideoForm video={formattedVideo} />
    </div>
  );
}
