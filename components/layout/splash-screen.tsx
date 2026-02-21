'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SPLASH_KEY = 'splash_shown';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only show splash once per session
    if (sessionStorage.getItem(SPLASH_KEY)) return;
    
    setVisible(true);
    sessionStorage.setItem(SPLASH_KEY, 'true');

    // Begin fade-out after 1.8s
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    // Remove from DOM after fade completes
    const removeTimer = setTimeout(() => setVisible(false), 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-dark-950 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Logo with scale + fade-in animation */}
      <div className="animate-splash-logo">
        <Image
          src="/image/xstream-logo.png"
          alt="eddythedaddy"
          width={120}
          height={120}
          className="rounded-2xl drop-shadow-2xl"
          priority
        />
      </div>

      {/* Brand text with staggered fade-in */}
      <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tighter text-white animate-splash-text">
        eddythe<span className="text-xred-600">daddy</span>
      </h1>

      {/* Subtle loading bar */}
      <div className="mt-8 w-48 h-0.5 bg-dark-800 rounded-full overflow-hidden">
        <div className="h-full bg-xred-600 rounded-full animate-splash-bar" />
      </div>
    </div>
  );
}
