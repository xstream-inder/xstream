'use client';

import { useActionState } from 'react';
import { submitContact } from '@/server/actions/support'; 
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form'; // Assuming you might have react-hook-form, but using pure formAction here for simplicity

// Minimal state interface for server action (you will need to implement the backend action)
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

export default function ContactPage() {
  // Using useActionState for form handling (Next.js 14/15+)
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  
  if (state.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've received your message and will get back to you within 24-48 hours.
          </p>
          <div className="flex flex-col space-y-3">
             <Link href="/" className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-xred-600 border border-transparent rounded-lg hover:bg-xred-700">
               Return Home
             </Link>
             <button onClick={() => window.location.reload()} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
               Send another message
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Info Side */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Get in touch
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Have a question, feedback, or need assistance? Our support team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-xred-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email Support
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                For general inquiries and support.
              </p>
              <a href="mailto:support@eddythedaddy.com" className="mt-3 block text-sm font-medium text-xred-600 hover:text-xred-500">
                support@eddythedaddy.com
              </a>
            </div>

             <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-xred-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Safety Center
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                To report abuse or safety concerns.
              </p>
              <a href="mailto:safety@eddythedaddy.com" className="mt-3 block text-sm font-medium text-xred-600 hover:text-xred-500">
                safety@eddythedaddy.com
              </a>
            </div>
             <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-xred-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                Legal Inquiries
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                For copyright and legal notices.
              </p>
              <a href="mailto:legal@eddythedaddy.com" className="mt-3 block text-sm font-medium text-xred-600 hover:text-xred-500">
                legal@eddythedaddy.com
              </a>
            </div>
             <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-xred-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                Media & Press
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                For press and media related questions.
              </p>
              <a href="mailto:press@eddythedaddy.com" className="mt-3 block text-sm font-medium text-xred-600 hover:text-xred-500">
                press@eddythedaddy.com
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>
          <form action={formAction} className="space-y-6">
            
            {state.message && !state.success && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                Error: {state.message}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white sm:text-sm p-3 border"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white sm:text-sm p-3 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <div className="mt-1">
                <select
                  id="subject"
                  name="subject"
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white sm:text-sm p-3 border"
                >
                  <option value="general">General Inquiry</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="technical">Technical Issue</option>
                  <option value="safety">Trust & Safety</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feedback">Feedback & Suggestions</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-600 shadow-sm focus:border-xred-500 focus:ring-xred-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white sm:text-sm p-3 border"
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-xred-600 hover:bg-xred-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xred-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
