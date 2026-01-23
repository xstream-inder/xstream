import { prisma } from '@/lib/prisma';
import { Sidebar } from './sidebar';

export async function CategoriesSidebar() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      videoCount: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { viewsCount: 'desc' },
    ],
    take: 20,
  });

  return <Sidebar categories={categories} />;
}
