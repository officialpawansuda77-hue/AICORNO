'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Key,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { OPUS_5_5_VIDEOS, OpusVideoItem } from '@/data/opusVideosData';
import { useAppStore } from '@/lib/store';
import { canCopyPrompt } from '@/lib/membership';
import confetti from 'canvas-confetti';

type SubcatFilter = 'All' | 'Motion graphics' | 'Explainers' | '3D scenes' | 'Games';

export default function OpusVideosPage() {
  const router = useRouter();
  const { openUpgradeModal, currentUser, addToast } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<SubcatFilter>('All');
  const [compareMode, setCompareMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return OPUS_5_5_VIDEOS;
    return OPUS_5_5_VIDEOS.filter((v) => v.subcategory === selectedCategory);
  }, [selectedCategory]);

  const handleCopy = (e: React.MouseEvent, item: OpusVideoItem) => {
    e.stopPropagation();
    e.preventDefault();

    if (!canCopyPrompt(item, currentUser)) {
      openUpgradeModal({
        reason: 'pro_prompt',
        itemTitle: item.title,
      });
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.prompt);
    }
    setCopiedId(item.id);
    addToast({
      title: 'Prompt copied!',
      message: `Opus 5.5 prompt for "${item.title}" copied to clipboard.`,
      type: 'success',
    });

    try {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#D8F651', '#101010', '#FF4B26'],
      });
    } catch {}

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const handleShare = (e: React.MouseEvent, item: OpusVideoItem) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/prompts/${item.id}`);
      addToast({
        title: 'Link copied!',
        message: 'Share URL copied to clipboard.',
        type: 'info',
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Breadcrumb & Subnav */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8A867D] mb-4">
          <Link href="/" className="hover:text-[#101010] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#101010]">AI videos</span>
          <span>/</span>
          <span className="text-[#101010]">Opus 5.5</span>
        </div>

        {/* Page Title & Intro */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-4xl sm:text-6xl font-black text-[#101010] tracking-tight leading-[1.08] mb-3">
            Opus 5.5 videos
          </h1>
          <p className="text-base sm:text-lg text-[#8A867D] font-medium leading-relaxed">
            Viral videos people made with Claude Opus 5.5. Each one comes with the original prompt and a live remake.
          </p>
        </div>

        {/* Category Filter Pills & Compare Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E4DA] mb-8">
          {/* Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { label: 'All', count: 475 },
              { label: 'Motion graphics', count: 288 },
              { label: 'Explainers', count: 62 },
              { label: '3D scenes', count: 55 },
              { label: 'Games', count: 70 },
            ].map((tab) => {
              const active = selectedCategory === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setSelectedCategory(tab.label as SubcatFilter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#D8F651] text-[#101010] shadow-2xs'
                      : 'bg-white hover:bg-[#F7F4EE] text-[#101010] border border-[#E8E4DA]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-black/10 text-[#101010]' : 'text-[#8A867D]'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Compare Toggle & Switch to Launch Motion Video */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/ai-videos/launch"
              className="text-xs font-black text-[#101010] hover:text-[#FF4B26] flex items-center gap-1 transition-colors"
            >
              <span>Launch Motion Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="h-4 w-[1px] bg-[#E8E4DA] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8A867D]">Compare</span>
              <button
                type="button"
                role="switch"
                aria-checked={compareMode}
                onClick={() => setCompareMode(!compareMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  compareMode ? 'bg-[#101010]' : 'bg-[#E8E4DA]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    compareMode ? 'translate-x-5 bg-[#D8F651]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredVideos.map((video) => {
            const isHovered = hoveredId === video.id;
            const isCopied = copiedId === video.id;
            const isLocked = video.is_pro && !canCopyPrompt(video, currentUser);

            return (
              <div
                key={video.id}
                onClick={() => router.push(`/prompts/${video.id}`)}
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group aicorn-card overflow-hidden bg-white border border-[#E8E4DA] hover:border-[#101010] flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-xs hover:shadow-md"
              >
                {/* Visual Video Preview Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#101010]">
                  <img
                    src={video.preview_url}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    {video.is_pro ? (
                      <span className="bg-[#101010]/90 backdrop-blur-md text-[#D8F651] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#D8F651]/40">
                        <Key className="w-2.5 h-2.5 text-[#D8F651]" />
                        <span>PRO</span>
                      </span>
                    ) : (
                      <span className="bg-white/90 backdrop-blur-md text-[#101010] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        FREE
                      </span>
                    )}

                    <span className="bg-black/60 backdrop-blur-md text-white/90 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {video.subcategory}
                    </span>
                  </div>

                  {/* Duration Badge Bottom Right */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Play className="w-2 h-2 fill-white" />
                    <span>{video.duration}</span>
                  </div>

                  {/* Play Button Overlay on Hover */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-12 h-12 rounded-full bg-[#101010]/85 text-[#D8F651] flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20 transform group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-[#D8F651] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-3.5 flex flex-col justify-between gap-3 flex-1 bg-white">
                  <div>
                    <h3 className="font-extrabold text-[#101010] text-sm leading-snug group-hover:text-black line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-[11px] text-[#8A867D] line-clamp-2 mt-1 font-medium leading-relaxed">
                      {compareMode ? video.prompt : video.description}
                    </p>
                  </div>

                  {/* Bottom Strip: Author Handle + Action Icons */}
                  <div className="pt-2 border-t border-[#F0EDE6] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src={video.author.avatar}
                        alt={video.author.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#E8E4DA]"
                      />
                      <span className="text-xs font-bold text-[#101010] truncate">
                        {video.handle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Copy Prompt Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, video)}
                        title={isLocked ? 'Unlock Pro Prompt' : 'Copy Prompt'}
                        className={`p-1.5 rounded-full text-xs transition-colors ${
                          isCopied
                            ? 'bg-[#101010] text-[#D8F651]'
                            : isLocked
                            ? 'bg-[#101010] text-[#D8F651] hover:bg-[#202020]'
                            : 'hover:bg-[#F7F4EE] text-[#101010]'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isLocked ? (
                          <Key className="w-3.5 h-3.5 text-[#D8F651]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Share Link */}
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, video)}
                        title="Share Prompt"
                        className="p-1.5 rounded-full hover:bg-[#F7F4EE] text-[#8A867D] hover:text-[#101010] transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Open Full Details */}
                      <button
                        type="button"
                        title="Open Details"
                        className="p-1.5 rounded-full hover:bg-[#F7F4EE] text-[#8A867D] hover:text-[#101010] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner to Manus 2.0 Launch Video Skill */}
        <div className="mt-16 p-6 sm:p-10 rounded-3xl bg-[#101010] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D8F651]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8F651] text-[#101010] text-[10px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3 text-[#101010]" />
              <span>FEATURED SKILL</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              Make a Manus 2.0 style launch video from your URL
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-medium">
              Transform any website URL into an autonomous 75–120 second kinetic product launch film cut to the beat.
            </p>
          </div>

          <Link
            href="/ai-videos/launch"
            className="pill-btn shrink-0 px-6 py-3.5 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs sm:text-sm rounded-full shadow-lg flex items-center gap-2 z-10 transition-transform active:scale-95"
          >
            <span>Explore Launch Video Skill</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </AppLayout>
  );
}
