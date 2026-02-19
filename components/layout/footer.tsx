import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 py-8 mt-auto z-40 relative">
      <div className="max-w-[1800px] mx-auto px-4">
        <nav aria-label="Footer navigation" className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
                eddythe<span className="text-xred-600">daddy</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              The premier destination for adult entertainment. Users must be 18+ to access this website.
            </p>
            <div className="flex items-center gap-2">
               <span className="inline-block px-2 py-1 text-[10px] font-bold border border-gray-300 dark:border-gray-700 rounded text-gray-500 uppercase">
                 RTA
               </span>
               <span className="inline-block px-2 py-1 text-[10px] font-bold border border-gray-300 dark:border-gray-700 rounded text-gray-500 uppercase">
                 18+
               </span>
            </div>
          </div>

          {/* Compliance */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-3">Compliance</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/legal/2257" className="hover:text-xred-600 transition-colors">
                  18 U.S.C. 2257 Record-Keeping
                </Link>
              </li>
              <li>
                <Link href="/legal/dmca" className="hover:text-xred-600 transition-colors">
                  DMCA / Copyright
                </Link>
              </li>
              <li>
                <Link href="/legal/content-removal" className="hover:text-xred-600 transition-colors">
                  Content Removal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
           <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/legal/terms" className="hover:text-xred-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
               <li>
                <Link href="/legal/privacy" className="hover:text-xred-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
               <li>
                <Link href="/legal/cookies" className="hover:text-xred-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

           {/* Support */}
           <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-xred-600 transition-colors">
                  F.A.Q.
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-xred-600 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-xred-600 transition-colors">
                  Upload Video
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {currentYear} eddythedaddy. All rights reserved.</p>
          <div className="mt-4 md:mt-0 max-w-xl text-center md:text-right opacity-60">
             eddythedaddy has a zero-tolerance policy against illegal pornography. All models appearing on this website were 18 years of age or older at the time of photography.
          </div>
        </div>
      </div>
    </footer>
  );
}
