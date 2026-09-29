'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeft, Search, Sparkles, Video, Bot } from 'lucide-react';

export default function NotFound() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/prompts/image?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/prompts/image');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#101010] text-[#D8F651] text-3xl font-black mb-6 shadow-sm">
          404
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-[#8A867D] mt-3 max-w-lg mx-auto leading-relaxed">
          The prompt, category, or guide you were looking for doesn&apos;t exist or has moved. Try searching our visual catalog below.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mt-8 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A867D] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts (e.g. cinematic, automotive)..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E8E4DA] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#101010] transition-colors shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="pill-btn px-5 py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-black text-xs sm:text-sm rounded-full transition-all shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8E4DA] hover:border-[#101010] text-[#101010] font-black text-xs rounded-full shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            href="/prompts/image"
            className="pill-btn inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-[#E8E4DA] hover:border-[#101010] text-[#101010] font-black text-xs rounded-full shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF4B26]" />
            <span>Image Prompts</span>
          </Link>
          <Link
            href="/prompts/video"
            className="pill-btn inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-[#E8E4DA] hover:border-[#101010] text-[#101010] font-black text-xs rounded-full shadow-2xs transition-colors"
          >
            <Video className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>Video Prompts</span>
          </Link>
          <Link
            href="/skills"
            className="pill-btn inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-[#E8E4DA] hover:border-[#101010] text-[#101010] font-black text-xs rounded-full shadow-2xs transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-[#101010]" />
            <span>Agent Skills</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
