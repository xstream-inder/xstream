'use client';

import { useState, useActionState, useEffect } from 'react';
import { submitReport } from '@/server/actions/reporting';
import { useFocusTrap } from '@/hooks/use-focus-trap';

interface ReportModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Inappropriate content for minors',
  'Violates Terms of Service',
  'Spam or misleading',
  'Harassment or bullying',
  'Copyright infringement',
  'Other',
];

interface State {
  success: boolean;
  message?: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
}

const initialState: State = {
  success: false,
  message: '',
  errors: {},
};

export function ReportModal({ videoId, isOpen, onClose }: ReportModalProps) {
  const [state, formAction, isPending] = useActionState(submitReport, initialState);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const dialogRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    if (state.success && !hasSubmitted) {
      setHasSubmitted(true);
    }
  }, [state.success, hasSubmitted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" ref={dialogRef}>
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-dark-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          
          {/* Header */}
          <div className="bg-white dark:bg-dark-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Report Video
                </h3>
                
                {hasSubmitted ? (
                   <div className="mt-4">
                      <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                        {state.message}
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-4 w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 sm:text-sm"
                      >
                        Close
                      </button>
                   </div>
                ) : (
                    <form action={formAction} className="mt-4 space-y-4">
                        <input type="hidden" name="videoId" value={videoId} />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reason
                            </label>
                            <select
                                name="reason"
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-lg"
                            >
                                <option value="">Select a reason</option>
                                {REPORT_REASONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                             {state.errors?.reason && <p className="text-xs text-red-600 mt-1">{state.errors.reason}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Additional Details
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="Please provide more context..."
                            ></textarea>
                        </div>
                        
                        {state.message && !state.success && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                                {state.message}
                            </div>
                        )}

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {isPending ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-dark-600 shadow-sm px-4 py-2 bg-white dark:bg-dark-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 sm:mt-0 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
