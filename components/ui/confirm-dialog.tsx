'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Fallback to native confirm if no provider
    return {
      confirm: async (options: ConfirmOptions) => window.confirm(options.message),
    };
  }
  return context;
}

interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    dialog?.resolve(true);
    setDialog(null);
  };

  const handleCancel = useCallback(() => {
    dialog?.resolve(false);
    setDialog(null);
  }, [dialog]);

  // Close on Escape key
  useEffect(() => {
    if (!dialog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, handleCancel]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white dark:bg-dark-900 rounded-xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {dialog.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {dialog.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                >
                  {dialog.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    dialog.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-xred-600 hover:bg-xred-700'
                  }`}
                >
                  {dialog.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
