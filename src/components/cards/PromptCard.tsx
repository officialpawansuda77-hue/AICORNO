'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Copy,
  Check,
  Play,
  Sparkles,
  Key,
} from 'lucide-react';
import { Prompt } from '@/types';
import { useAppStore } from '@/lib/store';
import { canCopyPrompt } from '@/lib/membership';
import { parseMediaUrl, isDirectVideoUrl } from '@/lib/mediaUtils';
import confetti from 'canvas-confetti';

interface PromptCardProps {
  prompt: Prompt;
  priority?: boolean;
}

function PromptCardComponent({ prompt, priority = false }: PromptCardProps) {
  const router = useRouter();
  const { prompts: storePrompts, toggleFavorite, isFavorite, incrementCopies, addToast, openUpgradeModal, currentUser } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [localCopies, setLocalCopies] = useState<number | null>(null);

  const favorited = isFavorite(prompt.id);

  const currentStorePrompt = storePrompts.find((p) => p.id === prompt.id);
  const displayCopies = localCopies !== null ? localCopies : (currentStorePrompt?.copies ?? prompt.copies ?? 0);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Check if this is a Pro item and user is not pro/admin
    if (!canCopyPrompt(prompt, currentUser)) {
      openUpgradeModal({
        reason: 'pro_prompt',
        itemTitle: prompt.title,
      });
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt.prompt);
    }

    setCopied(true);
    setLocalCopies(displayCopies + 1);
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
      className="aicorn-card group relative flex flex-col overflow-hidden bg-white cursor-pointer h-fit"
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
      <div
        className={`relative w-full overflow-hidden bg-[#EDEDEA] flex items-center justify-center ${
          prompt.aspect_ratio === '9:16'
            ? 'aspect-[9/16]'
            : prompt.aspect_ratio === '1:1'
            ? 'aspect-square'
            : prompt.aspect_ratio === '4:5'
            ? 'aspect-[4/5]'
            : prompt.aspect_ratio === '3:4'
            ? 'aspect-[3/4]'
            : 'aspect-[16/9]'
        }`}
      >
        {(() => {
          const videoMediaUrl = prompt.video_url || (prompt.type === 'video' && isDirectVideoUrl(prompt.preview_url) ? prompt.preview_url : undefined);
          const isDirectVideo = Boolean(videoMediaUrl && isDirectVideoUrl(videoMediaUrl));
          const parsedVideo = parseMediaUrl(videoMediaUrl || prompt.video_url);
          const imageSrc = !isDirectVideoUrl(prompt.preview_url) && prompt.preview_url
            ? prompt.preview_url
            : parsedVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';

          if (prompt.type === 'video' && isDirectVideo && !parsedVideo.thumbnailUrl) {
            return (
              <video
                src={videoMediaUrl}
                poster={imageSrc}
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            );
          }

          if (prompt.type === 'video' && parsedVideo.isGoogleDrive && parsedVideo.googleDriveId) {
            return (
              <div className="relative w-full h-full bg-[#101010] flex items-center justify-center overflow-hidden">
                <img
                  src={`https://lh3.googleusercontent.com/d/${parsedVideo.googleDriveId}=w1000`}
                  alt={prompt.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading={priority ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('iframe')) {
                      const iframe = document.createElement('iframe');
                      iframe.src = `${parsedVideo.embedUrl}?autoplay=0`;
                      iframe.className = 'w-full h-full border-0 pointer-events-none';
                      iframe.tabIndex = -1;
                      parent.appendChild(iframe);
                    }
                  }}
                />
              </div>
            );
          }

          return (
            <img
              src={imageSrc}
              alt={prompt.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={(e) => {
                if ((e.target as HTMLImageElement).src !== 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop') {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
                }
              }}
            />
          );
        })()}

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
            <span className="bg-[#101010]/90 backdrop-blur-md text-[#D8F651] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-[#D8F651]/40">
              <Key className="w-3 h-3 text-[#D8F651]" />
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
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none opacity-0 scale-95 group-hover:opacity-90 group-hover:scale-105">
            <div className="w-14 h-14 rounded-full bg-[#101010]/80 text-[#D8F651] flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20">
              <Play className="w-6 h-6 fill-[#D8F651] ml-0.5" />
            </div>
          </div>
        )}

        {/* Creator Handle Pill on bottom-left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white/95 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {prompt.author?.handle || '@creator'}
          </span>
        </div>
      </div>

      {/* COMPACT CARD CONTENT: Title + Action Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
        {/* Title */}
        <h3 className="font-extrabold text-[#1A1A1A] text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-black">
          <Link
            href={`/prompts/${prompt.id}`}
            onClick={(event) => event.stopPropagation()}
            className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#101010] rounded"
          >
            {prompt.title}
          </Link>
        </h3>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-2.5 border-t border-[#F0EDE6] flex items-center justify-between gap-2">
          {/* Copy Prompt Button */}
          <button
            onClick={handleCopy}
            className={`pill-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black transition-all ${
              copied
                ? 'bg-[#101010] text-[#D8F651]'
                : prompt.is_pro && !canCopyPrompt(prompt, currentUser)
                ? 'bg-[#101010] text-[#D8F651] hover:bg-[#202020]'
                : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied ✓</span>
              </>
            ) : prompt.is_pro && !canCopyPrompt(prompt, currentUser) ? (
              <>
                <Key className="w-3.5 h-3.5 text-[#D8F651]" />
                <span>Unlock Prompt</span>
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
            <span>{formatCount(displayCopies)}{' '}copies</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PromptCard = React.memo(PromptCardComponent);
export default PromptCard;
