'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as tus from 'tus-js-client';
import { createUploadSignature } from '@/server/actions/bunny';
import { finalizeUpload } from '@/server/actions/video';

const uploadSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  orientation: z.enum(["STRAIGHT", "GAY", "TRANS", "LESBIAN"]),
  models: z.string().optional(), // Comma separated
  tags: z.string().optional(),   // Comma separated
});

type UploadFormData = z.infer<typeof uploadSchema>;

export function AdminUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      orientation: 'STRAIGHT',
    }
  });

  const onSubmit = async (data: UploadFormData) => {
    if (!file) {
      alert("Please select a video file");
      return;
    }

    setUploading(true);

    try {
      // 1. Get Signature
      const signature = await createUploadSignature(file.name);

      // 2. TUS Upload
      const upload = new tus.Upload(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000],
        headers: {
          AuthorizationSignature: signature.authorizationSignature,
          AuthorizationExpire: signature.expirationTime.toString(),
          VideoId: signature.videoId,
          LibraryId: signature.libraryId,
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
        },
        onSuccess: async () => {
          // 3. Finalize & Save Metadata
          // Parse CSV strings to arrays
          const modelNames = data.models?.split(',').map(s => s.trim()).filter(Boolean) || [];
          const tagNames = data.tags?.split(',').map(s => s.trim()).filter(Boolean) || [];

          // Note: Real implementation would resolve model names to IDs or create them.
          // For now we assume finalizeUpload can handle simple ID mapping or we extend it.
          // Using a fictional 'adminFinalize' payload structure here for simplicity.
          
          await finalizeUpload(signature.videoId, {
            title: data.title,
            orientation: data.orientation,
            // Assuming we pass category IDs - in real app, fetch category ID from slug/name
            categoryIds: [/* Map data.category to ID */], 
            description: `Tags: ${tagNames.join(', ')}`,
          });
          
          setUploading(false);
          setProgress(0);
          setFile(null);
          reset();
          alert("Upload Complete");
        },
        onError: (err) => {
          console.error(err);
          setUploading(false);
          alert("Upload Failed");
        }
      });

      upload.start();

    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Error initializing upload");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Input */}
      <div>
        <label className="block text-sm font-medium dark:text-gray-300 mb-2">Video File</label>
        <input 
          type="file" 
          accept="video/*"
          disabled={uploading}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-xred-50 file:text-xred-700 hover:file:bg-xred-100"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium dark:text-gray-300">Title</label>
        <input 
          {...register("title")}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 dark:bg-dark-900 shadow-sm focus:border-xred-500 focus:ring-xred-500 text-white"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Category</label>
          <select 
            {...register("category")}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 dark:bg-dark-900 shadow-sm focus:border-xred-500 focus:ring-xred-500 text-white"
          >
            <option value="Amateur">Amateur</option>
            <option value="Teen">Teen</option>
            <option value="Milf">Milf</option>
            <option value="Asian">Asian</option>
            <option value="Hentai">Hentai</option>
            <option value="VR">VR</option>
          </select>
        </div>

        {/* Orientation */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Orientation</label>
          <div className="mt-2 flex gap-4">
            {['STRAIGHT', 'GAY', 'TRANS'].map((opt) => (
              <label key={opt} className="inline-flex items-center">
                <input 
                  type="radio" 
                  value={opt}
                  {...register("orientation")}
                  className="form-radio text-xred-600 focus:ring-xred-500" 
                />
                <span className="ml-2 text-sm dark:text-gray-300 capitalize">{opt.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Models & Tags */}
      <div>
        <label className="block text-sm font-medium dark:text-gray-300">Models (CSV)</label>
        <input 
          {...register("models")}
          placeholder="Model Name, Other Model"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 dark:bg-dark-900 shadow-sm focus:border-xred-500 focus:ring-xred-500 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium dark:text-gray-300">Tags (CSV)</label>
        <input 
          {...register("tags")}
          placeholder="blonde, outdoor, hd"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 dark:bg-dark-900 shadow-sm focus:border-xred-500 focus:ring-xred-500 text-white"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-xred-600 hover:bg-xred-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 disabled:opacity-50"
      >
        {uploading ? `Uploading ${progress}%` : 'Upload Video'}
      </button>
    </form>
  );
}