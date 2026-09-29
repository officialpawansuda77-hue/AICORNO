'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-[#101010] text-white px-4 py-2 text-xs md:text-sm font-medium z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left message with lime pill */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="bg-[#D8F651] text-[#101010] text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shrink-0">
            NEW
          </span>
          <p className="truncate text-white/90">
            <span className="font-semibold text-white">Veo 3 & Opus 5.5 prompts are live.</span>{' '}
            Discover the latest high-converting AI prompts & agent skills.
          </p>
        </div>

        {/* Right CTA and dismiss */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/prompts/video"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-bold text-xs px-3 py-1 rounded-full transition-transform active:scale-95"
          >
            <span>Explore Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss banner"
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
