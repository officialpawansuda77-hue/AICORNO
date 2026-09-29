'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('aicorn_cookie_consent');
      if (!consent) {
        // Small delay so it animates in smoothly
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('aicorn_cookie_consent', 'all');
    } catch {}
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('aicorn_cookie_consent', 'essential');
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-3xl bg-[#101010] text-white border border-white/10 shadow-2xl animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-[#D8F651]" />
          </div>
          <h4 className="text-sm font-black tracking-tight text-white">We Respect Your Privacy</h4>
        </div>
        <button
          onClick={handleEssentialOnly}
          aria-label="Close cookie consent banner"
          className="text-white/50 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-white/70 leading-relaxed mb-4">
        We use cookies and secure storage to authenticate creators, remember your saved favorites, and analyze trending prompts. Read our{' '}
        <Link href="/cookie-policy" className="underline text-[#D8F651] hover:text-[#C5E53E]">
          Cookie Policy
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline text-white hover:text-white/80">
          Privacy Policy
        </Link>.
      </p>

      <div className="flex items-center gap-2.5">
        <button
          onClick={handleAcceptAll}
          className="pill-btn flex-1 py-2 px-4 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] text-xs font-black rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept All</span>
        </button>
        <button
          onClick={handleEssentialOnly}
          className="pill-btn py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-colors"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
