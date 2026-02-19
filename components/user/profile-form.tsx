'use client';

import { useActionState, useState, useRef } from 'react';
import { updateProfile } from '@/server/actions/user';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-xred-600 hover:bg-xred-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

interface UserProps {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    authProvider: string | null;
    role: string;
}

const initialState: { success: boolean; error: string; message: string } = {
    success: false,
    error: '',
    message: '',
};

export function ProfileForm({ user }: { user: UserProps }) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const isCredentialsUser = !user.authProvider || user.authProvider === 'credentials';
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [avatarUrlValue, setAvatarUrlValue] = useState<string>(user.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Image must be smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);
      setAvatarUrlValue(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form action={formAction} className="space-y-6">
        {/* Read Only Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                </label>
                <input
                    type="text"
                    disabled
                    value={user.username}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-600 bg-gray-100 dark:bg-dark-900 text-gray-500 shadow-sm sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                </label>
                <input
                    type="text"
                    disabled
                    value={user.email}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-600 bg-gray-100 dark:bg-dark-900 text-gray-500 shadow-sm sm:text-sm"
                />
            </div>
        </div>

        <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Details</h3>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                </label>
                
                {/* Avatar Preview */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-700 flex-shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                        {user.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                    >
                      Upload Image
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => { setAvatarPreview(null); setAvatarUrlValue(''); }}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                />
                
                {/* Hidden field to pass avatar URL to server action */}
                <input type="hidden" name="avatarUrl" value={avatarUrlValue} />
                
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP or GIF. Max 2MB. Or paste a URL below:
                </p>
                <input
                    type="url"
                    value={avatarUrlValue.startsWith('data:') ? '' : avatarUrlValue}
                    onChange={(e) => { setAvatarUrlValue(e.target.value); setAvatarPreview(e.target.value || null); }}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-xred-500 sm:text-sm px-3 py-2"
                />
            </div>
        </div>

        {isCredentialsUser && (
             <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-xred-500 sm:text-sm px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-xred-500 sm:text-sm px-3 py-2"
                        />
                    </div>
                </div>
            </div>
        )}

       {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {state.error}
            </div>
       )}
       
       {state.success && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 text-sm">
                {state.message}
            </div>
       )}
       
       <div className="pt-4">
            <SubmitButton />
       </div>
    </form>
  );
}
