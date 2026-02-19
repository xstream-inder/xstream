import { prisma } from '@/lib/prisma';
import { createTag, deleteTag } from '@/server/actions/admin';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helper';

export default async function AdminTagsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit display for performance
  });

  async function addTag(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    if (name) await createTag(name);
  }

  async function removeTag(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (id) await deleteTag(id);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Manage Tags</h1>
      
      {/* Add Form */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Tag</h2>
        <form action={addTag} className="flex gap-4">
          <input
            name="name"
            placeholder="Tag Name"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-dark-700 dark:border-gray-600 dark:text-white"
            required
          />
          <button type="submit" className="bg-xred-600 text-white px-6 py-2 rounded-lg hover:bg-xred-700">
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Slug</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-6 py-4 dark:text-white">{tag.name}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{tag.slug}</td>
                <td className="px-6 py-4 text-right">
                  <form action={removeTag}>
                    <input type="hidden" name="id" value={tag.id} />
                    <button type="submit" className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
