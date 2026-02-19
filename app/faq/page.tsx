import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find answers to common questions about using eddythedaddy.
        </p>
      </div>
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 sm:p-8">
        <Accordion type="single" collapsible className="w-full">
          {/* Account & Safety */}
          <div className="mb-4 text-xs font-semibold uppercase text-gray-400 tracking-wider">Account & Safety</div>
          
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left font-medium">Is eddythedaddy free to use?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              Yes! Signing up and watching most content on eddythedaddy is completely free. We also offer a Premium membership that removes ads and unlocks exclusive features like 4K streaming and downloading.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left font-medium">How do I reset my password?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              You can reset your password by clicking "Forgot Password" on the login screen, or by visiting the <Link href="/auth/reset" className="text-xred-600 hover:underline">Password Reset</Link> page. We'll send you an email with instructions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left font-medium">How do I verify my age?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              We require all users to be 18 years of age or older. We use automated age verification systems during signup in regions where it is legally required. You may be asked to upload a government-issued ID.
            </AccordionContent>
          </AccordionItem>
          
          <div className="my-6 border-t border-gray-100 dark:border-dark-700"></div>
          
          {/* Content & Uploading */}
          <div className="mb-4 text-xs font-semibold uppercase text-gray-400 tracking-wider">Content & Creators</div>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left font-medium">How can I upload videos?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              To upload videos, you must first create an account and verify your email. Once logged in, click the "Upload" button in the top navigation bar. You may need to complete a creator verification process before your videos are public.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left font-medium">What content is allowed?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              We allow adult content featuring consenting adults (18+). We have a zero-tolerance policy for illegal content, non-consensual content, violence, and hate speech. Please review our <Link href="/legal/terms" className="text-xred-600 hover:underline">Terms of Service</Link> for full guidelines.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left font-medium">How do I monetize my content?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              Creators can earn revenue through ad sharing, premium subscriptions, and tips. To join our Partner Program, go to your Studio dashboard conform you meet the eligibility requirements (views/subscribers), and apply.
            </AccordionContent>
          </AccordionItem>

          <div className="my-6 border-t border-gray-100 dark:border-dark-700"></div>

          {/* Technical & Payments */}
          <div className="mb-4 text-xs font-semibold uppercase text-gray-400 tracking-wider">Billing & Technical</div>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-left font-medium">How do I cancel my Premium subscription?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              Go to your <Link href="/settings" className="text-xred-600 hover:underline">Settings</Link> page and look for the "Billing" section. You can cancel your subscription there at any time. Your benefits will continue until the end of the current billing period.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-left font-medium">Why is a video buffering or not playing?</AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              Please check your internet connection first. If the issue persists, try clearing your browser cache, disabling ad-blockers, or trying a different browser. If a specific video is broken, please use the "Report" button.
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Still have questions?
        </p>
        <Link 
          href="/contact" 
          className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-xred-600 hover:bg-xred-700"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
