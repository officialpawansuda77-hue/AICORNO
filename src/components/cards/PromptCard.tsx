'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Copy,
  Check,
  Play,
  Sparkles
} from 'lucide-react';
import { Prompt } from '@/types';
import { useAppStore } from '@/lib/store';
import { normalizeCategoryName } from '@/lib/categories';
import { parseMediaUrl } from '@/lib/mediaUtils';
import confetti from 'canvas-confetti';

interface PromptCardProps {
  prompt: Prompt;
  priority?: boolean;
}

export default function PromptCard({ prompt, priority = false }: PromptCardProps) {
  const router = useRouter();
  const { toggleFavorite, isFavorite, incrementCopies, addToast } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const favorited = isFavorite(prompt.id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt.prompt);
    }

    setCopied(true);
    incrementCopies(prompt.id);
    addToast({
      title: 'Prompt Copied!',
      message: `Prompt for "${prompt.title}" copied to clipboard.`,
      type: 'success',
    });

    try {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#D8F651', '#101010', '#FF4B26'],
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(prompt.id);
  };

  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="aicorn-card group relative flex flex-col overflow-hidden bg-white cursor-pointer"
      role="link"
      tabIndex={0}
      aria-label={`Open ${prompt.title}`}
      onClick={() => router.push(`/prompts/${prompt.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          router.push(`/prompts/${prompt.id}`);
        }
      }}
    >
      {/* MEDIA PREVIEW CONTAINER */}
      <div className={`relative w-full overflow-hidden bg-[#EDEDEA] ${prompt.aspect_ratio === '9:16' ? 'aspect-[9/14]' : prompt.aspect_ratio === '4:5' ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}>
        <img
          src={prompt.preview_url || (prompt.type === 'video' ? parseMediaUrl(prompt.video_url).thumbnailUrl : '') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'}
          alt={prompt.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Favorite Icon Button Overlay */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-[#1A1A1A] transition-all hover:scale-110 shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'text-[#FF4B26] fill-[#FF4B26]' : 'text-[#1A1A1A]'
            }`}
          />
        </button>

        {/* Top Left Tags: Free / Pro & Type */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {prompt.is_pro ? (
            <span className="bg-[#101010]/85 backdrop-blur-md text-[#D8F651] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#D8F651]" />
              <span>PRO</span>
            </span>
          ) : (
            <span className="bg-white/85 backdrop-blur-md text-[#101010] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
              FREE
            </span>
          )}

          {prompt.type === 'video' && (
            <span className="bg-[#101010]/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-[#D8F651] text-[#D8F651]" />
              <span>VIDEO</span>
            </span>
          )}
        </div>

        {/* Video Overlay Specs (duration & aspect ratio) */}
        {prompt.type === 'video' && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
            {prompt.duration && (
              <span className="bg-black/80 backdrop-blur-md text-[#D8F651] text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                {prompt.duration}
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-mono px-1.5 py-0.5 rounded-md">
              {prompt.aspect_ratio}
            </span>
          </div>
        )}

        {/* Video Play Overlay Indicator */}
        {prompt.type === 'video' && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-90 scale-105' : 'opacity-0 scale-95'}`}>
            <div className="w-14 h-14 rounded-full bg-[#101010]/80 text-[#D8F651] flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20">
              <Play className="w-6 h-6 fill-[#D8F651] ml-0.5" />
            </div>
          </div>
        )}

        {/* Creator Handle Pill on bottom-left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white/95 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {prompt.author?.handle || '@aicorn'}
          </span>
        </div>
      </div>

      {/* METADATA CONTENT */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category & Model Line */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[#8A867D]">
              {normalizeCategoryName(prompt.category)}
            </span>
            <span className="text-[11px] font-bold text-[#101010] bg-[#F7F4EE] px-2 py-0.5 rounded-full border border-[#E8E4DA]">
              {prompt.model}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-[#1A1A1A] text-base leading-snug line-clamp-1 group-hover:text-black">
            <Link
              href={`/prompts/${prompt.id}`}
              onClick={(event) => event.stopPropagation()}
              className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#101010] rounded"
            >
              {prompt.title}
            </Link>
          </h3>

          {/* Prompt excerpt snippet */}
          <p className="text-xs text-[#8A867D] line-clamp-2 mt-1 font-medium leading-relaxed">
            {prompt.description || prompt.prompt}
          </p>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-2 border-t border-[#F0EDE6] flex items-center justify-between gap-2">
          {/* Copy Prompt Button */}
          <button
            onClick={handleCopy}
            className={`pill-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black transition-all ${
              copied
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>

          {/* Copies count & Views */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A867D]">
            <span>{formatCount(prompt.copies)}{' '}copies</span>
          </div>
        </div>

      </div>
    </div>
  );
}
