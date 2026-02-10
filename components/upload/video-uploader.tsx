'use client';

import { useState, useRef } from 'react';
import * as tus from 'tus-js-client';
import { createUploadSignature } from '@/server/actions/bunny';
import { finalizeUpload } from '@/server/actions/video';

interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
}

interface VideoMetadata {
  title: string;
  description: string;
  orientation: string;
  isPremium: boolean;
  selectedModels: string[];
  newModelNames: string[];
  selectedCategories: string[];
  tags: string;
}

interface Model {
  id: string;
  stageName: string;
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface VideoUploaderProps {
  models: Model[];
  categories: Category[];
  availableTags?: Tag[];
  isAdmin?: boolean;
}

export function VideoUploader({ models, categories, availableTags = [], isAdmin = false }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modelInput, setModelInput] = useState('');
  const [progress, setProgress] = useState<UploadProgress>({
    bytesUploaded: 0,
    bytesTotal: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    orientation: 'STRAIGHT',
    isPremium: false,
    selectedModels: [],
    newModelNames: [],
    selectedCategories: [],
    tags: '',
  });
  
  const uploadRef = useRef<tus.Upload | null>(null);

  const toggleModel = (modelId: string) => {
    setMetadata(prev => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(modelId)
        ? prev.selectedModels.filter(id => id !== modelId)
        : [...prev.selectedModels, modelId],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setMetadata(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const addCustomModel = () => {
    if (!modelInput.trim()) return;
    if (metadata.newModelNames.includes(modelInput.trim())) return;
    
    setMetadata(prev => ({
      ...prev,
      newModelNames: [...prev.newModelNames, modelInput.trim()]
    }));
    setModelInput('');
  };

  const removeCustomModel = (name: string) => {
    setMetadata(prev => ({
      ...prev,
      newModelNames: prev.newModelNames.filter(n => n !== name)
    }));
  };

  const addTag = (tagName: string) => {
    const currentTags = metadata.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tagName)) {
      setMetadata(prev => ({
        ...prev,
        tags: [...currentTags, tagName].join(', ')
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setProgress({ bytesUploaded: 0, bytesTotal: 0, percentage: 0 });
      setUploadedVideoId(null);
      
      // Auto-populate title from filename
      if (!metadata.title) {
        const titleFromFile = selectedFile.name.replace(/\.[^/.]+$/, '');
        setMetadata(prev => ({ ...prev, title: titleFromFile }));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!metadata.title.trim()) {
      setError('Please provide a video title');
      return;
    }

    setUploading(true);
    setError(null);

    try{
      // Step 1: Get upload signature from server
      const signature = await createUploadSignature(file.name);

      // Step 2: Initialize TUS upload
      const upload = new tus.Upload(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        headers: {
          AuthorizationSignature: signature.authorizationSignature,
          AuthorizationExpire: signature.expirationTime.toString(),
          VideoId: signature.videoId,
          LibraryId: signature.libraryId,
        },
        onError: (error) => {
          console.error('Upload error:', error);
          setError(`Upload failed: ${error.message}`);
          setUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          setProgress({
            bytesUploaded,
            bytesTotal,
            percentage,
          });
        },
        onSuccess: async () => {
          console.log('Upload Complete! Finalizing...');
          
          try {
            // Process tags
            const tagsArray = metadata.tags
              .split(',')
              .map(t => t.trim())
              .filter(t => t.length > 0);

            // Step 3: Finalize upload and update metadata
            const result = await finalizeUpload(signature.videoId, {
              title: metadata.title,
              description: metadata.description || undefined,
              orientation: metadata.orientation as any,
              isPremium: metadata.isPremium,
              modelIds: metadata.selectedModels,
              newModelNames: metadata.newModelNames, // Pass new models
              categoryIds: metadata.selectedCategories,
              tags: tagsArray,
            });

            if (result.success) {
              setUploadedVideoId(result.video?.id || signature.videoId);
              setUploading(false);
              setFile(null);
              setMetadata({
                title: '',
                description: '',
                orientation: 'STRAIGHT',
                isPremium: false,
                selectedModels: [],
                newModelNames: [],
                selectedCategories: [],
                tags: '',
              });
            } else {
              setError(result.error || 'Failed to finalize upload');
              setUploading(false);
            }
          } catch (err) {
            console.error('Finalization error:', err);
            setError('Upload completed but failed to finalize. Please check your profile.');
            setUploading(false);
          }
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (err) {
      console.error('Upload initialization error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize upload'
      );
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setUploading(false);
    setProgress({ bytesUploaded: 0, bytesTotal: 0, percentage: 0 });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 space-y-4 border border-gray-200 dark:border-dark-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Video</h2>
        
        {/* Video Metadata */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="video-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Video Title *
            </label>
            <input
              id="video-title"
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              disabled={uploading}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              maxLength={200}
            />
          </div>

          <div>
            <label
              htmlFor="video-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="video-description"
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              disabled={uploading}
              placeholder="Add a description to help viewers find your video"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          
          <div className="flex items-center">
             {isAdmin && (
               <div className="flex items-center">
                  <input
                      id="isPremium"
                      type="checkbox"
                      checked={metadata.isPremium}
                      onChange={(e) => setMetadata(prev => ({ ...prev, isPremium: e.target.checked }))}
                      disabled={uploading}
                      className="h-4 w-4 text-xred-600 focus:ring-xred-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-900 dark:text-white font-medium">
                      Premium Content (Subscribers Only)
                  </label>
               </div>
             )}
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="video-tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Tags (comma separated)
            </label>
            <input
              id="video-tags"
              type="text"
              value={metadata.tags}
              onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
              disabled={uploading}
              placeholder="teen, blonde, outdoor, pov"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-2"
            />
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400 self-center">Popular:</span>
                {availableTags.map(tag => (
                   <button
                     key={tag.id}
                     type="button"
                     onClick={() => addTag(tag.name)}
                     className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                   >
                     {tag.name}
                   </button>
                ))}
              </div>
            )}
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Orientation
            </label>
            <div className="flex gap-4">
              {['STRAIGHT', 'GAY', 'TRANS', 'LESBIAN'].map((opt) => (
                <label key={opt} className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="orientation"
                    value={opt}
                    checked={metadata.orientation === opt}
                    onChange={(e) => setMetadata(prev => ({ ...prev, orientation: e.target.value }))}
                    disabled={uploading}
                    className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 capitalize">{opt.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    metadata.selectedCategories.includes(category.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Models */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Models
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    metadata.selectedModels.includes(model.id)
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {model.stageName}
                </button>
              ))}
              {metadata.newModelNames.map((name) => (
                 <span
                  key={name}
                  className="px-3 py-1 text-sm rounded-full bg-pink-100 dark:bg-pink-900 border border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200 flex items-center gap-1"
                >
                  {name}
                  <button type="button" onClick={() => removeCustomModel(name)} className="hover:text-pink-900 dark:hover:text-pink-100">×</button>
                </span>
              ))}
            </div>
            {/* Add New Model */}
            <div className="flex gap-2">
                <input 
                  type="text" 
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomModel())}
                  placeholder="Add new model name..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button 
                  type="button" 
                  onClick={addCustomModel}
                  disabled={!modelInput.trim()}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200 disabled:opacity-50"
                >
                  Add
                </button>
            </div>
          </div>
        </div>

        {/* File Input */}
        <div>
          <label
            htmlFor="video-file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >          
            Select Video File
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:file:bg-blue-900 dark:file:text-blue-200"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {file.name} ({formatBytes(file.size)})
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {progress.percentage === 100 ? 'Finalizing...' : 'Uploading...'}
              </span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(progress.bytesUploaded)} / {formatBytes(progress.bytesTotal)}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {uploadedVideoId && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              ✅ Upload successful! Your video is now being processed.
            </p>
            <a
              href="/profile"
              className="text-sm font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              View in your profile →
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!uploading ? (
            <button
              onClick={handleUpload}
              disabled={!file || !metadata.title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Upload Video
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Cancel Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
