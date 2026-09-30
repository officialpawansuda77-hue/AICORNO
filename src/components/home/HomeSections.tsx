'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Video, Image as ImageIcon, Bot, Flame, ChevronRight, Key } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CATEGORIES } from '@/data/categoriesModels';
import PromptCard from '@/components/cards/PromptCard';
import CategoryCard from '@/components/cards/CategoryCard';
import { isDirectVideoUrl, parseMediaUrl } from '@/lib/mediaUtils';
import { normalizeCategoryName } from '@/lib/categories';

export function ExploreSection() {
  const { prompts, skills, homeFeatured } = useAppStore();

  // Find real uploaded image prompt (admin selected or latest)
  const featuredImagePrompt =
    prompts.find((p) => p.type === 'image' && (p.id === homeFeatured.imagePromptId || p.featured_on_home)) ||
    prompts.find((p) => p.type === 'image');

  // Find real uploaded video prompt (admin selected or latest)
  const featuredVideoPrompt =
    prompts.find((p) => p.type === 'video' && (p.id === homeFeatured.videoPromptId || p.featured_on_home)) ||
    prompts.find((p) => p.type === 'video');

  // Find real skill
  const featuredSkill =
    skills.find((s) => s.id === homeFeatured.skillId) ||
    skills[0];

  const imagePreview = featuredImagePrompt?.preview_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop';
  
  const videoMediaUrl = featuredVideoPrompt?.video_url || (featuredVideoPrompt && isDirectVideoUrl(featuredVideoPrompt.preview_url) ? featuredVideoPrompt.preview_url : undefined);
  const isDirectVideo = Boolean(videoMediaUrl && isDirectVideoUrl(videoMediaUrl));
  const parsedVideo = parseMediaUrl(videoMediaUrl || featuredVideoPrompt?.video_url);
  const videoThumb = !isDirectVideoUrl(featuredVideoPrompt?.preview_url) && featuredVideoPrompt?.preview_url
    ? featuredVideoPrompt.preview_url
    : (parsedVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop');

  const skillPreview = featuredSkill?.preview_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#8A867D]">
            CATALOG ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#101010] mt-1">
            Explore AICORN
          </h2>
        </div>
        <p className="text-sm text-[#8A867D] max-w-md">
          Three specialized libraries engineered for high aesthetic standards, commercial conversion, and autonomous AI execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        
        {/* Card 1: Image Prompts */}
        <div className="aicorn-card overflow-hidden flex flex-col justify-between group">
          <Link
            href={featuredImagePrompt ? `/prompts/${featuredImagePrompt.id}` : '/prompts/image'}
            className="relative h-44 sm:h-52 md:h-64 overflow-hidden bg-[#EDEDEA] block cursor-pointer"
          >
            <img
              src={imagePreview}
              alt={featuredImagePrompt?.title || 'Visual Image Prompts'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop';
              }}
            />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 z-10">
              <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-[#101010] flex items-center gap-1.5 shadow-sm">
                <ImageIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#101010]" />
                <span>IMAGE PROMPTS</span>
              </div>
              {featuredImagePrompt?.is_pro && (
                <div className="bg-[#101010]/90 text-[#D8F651] px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-[#D8F651]/40">
                  <Key className="w-2.5 h-2.5" /> PRO
                </div>
              )}
            </div>
            {featuredImagePrompt && (
              <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full max-w-[55%] truncate">
                {featuredImagePrompt.title}
              </div>
            )}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-black/80 text-white font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded">
              {featuredImagePrompt?.model || 'Midjourney'}
            </div>
          </Link>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-black text-[#101010] mb-1 sm:mb-2 line-clamp-1">
              {featuredImagePrompt ? featuredImagePrompt.title : 'Visual AI Image Prompts'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-4 sm:mb-6 leading-relaxed line-clamp-2">
              {featuredImagePrompt?.description ||
                'Curated photorealistic, minimal, and editorial prompts for Midjourney, Flux.1 Pro, and Nano Banana.'}
            </p>
            <Link
              href={featuredImagePrompt ? `/prompts/${featuredImagePrompt.id}` : '/prompts/image'}
              className="pill-btn w-full py-2.5 sm:py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{featuredImagePrompt ? 'Open Image Prompt' : 'Explore Image Prompts'}</span>
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D8F651]" />
            </Link>
          </div>
        </div>

        {/* Card 2: Video Prompts */}
        <div className="aicorn-card overflow-hidden flex flex-col justify-between group">
          <Link
            href={featuredVideoPrompt ? `/prompts/${featuredVideoPrompt.id}` : '/prompts/video'}
            className="relative h-44 sm:h-52 md:h-64 overflow-hidden bg-[#EDEDEA] block cursor-pointer"
          >
            {isDirectVideo ? (
              <video
                src={videoMediaUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <img
                src={videoThumb}
                alt={featuredVideoPrompt?.title || 'Cinematic Video Prompts'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';
                }}
              />
            )}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 z-10">
              <div className="bg-[#101010] px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-[#D8F651] flex items-center gap-1.5 shadow-sm">
                <Video className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#D8F651]" />
                <span>VIDEO PROMPTS</span>
              </div>
              {featuredVideoPrompt?.is_pro && (
                <div className="bg-[#101010]/90 text-[#D8F651] px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-[#D8F651]/40">
                  <Key className="w-2.5 h-2.5" /> PRO
                </div>
              )}
            </div>
            {featuredVideoPrompt && (
              <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full max-w-[55%] truncate">
                {featuredVideoPrompt.title}
              </div>
            )}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-black/80 text-white font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded">
              {featuredVideoPrompt?.model || 'Veo 3'}
            </div>
          </Link>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-black text-[#101010] mb-1 sm:mb-2 line-clamp-1">
              {featuredVideoPrompt ? featuredVideoPrompt.title : 'Cinematic AI Video Prompts'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-4 sm:mb-6 leading-relaxed line-clamp-2">
              {featuredVideoPrompt?.description ||
                'Commercial camera directions, FPV drone swoops, lighting specs, and motion prompts for Veo 3, Kling, and Sora.'}
            </p>
            <Link
              href={featuredVideoPrompt ? `/prompts/${featuredVideoPrompt.id}` : '/prompts/video'}
              className="pill-btn w-full py-2.5 sm:py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{featuredVideoPrompt ? 'Open Video Prompt' : 'Explore Video Prompts'}</span>
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D8F651]" />
            </Link>
          </div>
        </div>

        {/* Card 3: AI Agent Skills */}
        <div className="aicorn-card overflow-hidden flex flex-col justify-between group">
          <Link
            href={featuredSkill ? `/skills/${featuredSkill.id}` : '/skills'}
            className="relative h-44 sm:h-52 md:h-64 overflow-hidden bg-[#EDEDEA] block cursor-pointer"
          >
            <img
              src={skillPreview}
              alt={featuredSkill?.title || 'Agent Skills'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';
              }}
            />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 z-10">
              <div className="bg-[#D8F651] text-[#101010] px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-sm">
                <Bot className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#101010]" />
                <span>AGENT SKILLS</span>
              </div>
              {featuredSkill?.is_pro && (
                <div className="bg-[#101010]/90 text-[#D8F651] px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-[#D8F651]/40">
                  <Key className="w-2.5 h-2.5" /> PRO
                </div>
              )}
            </div>
            {featuredSkill && (
              <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full max-w-[55%] truncate">
                {featuredSkill.title}
              </div>
            )}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-black/80 text-white font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded">
              {featuredSkill?.compatible_agents?.[0] || 'Claude Code'}
            </div>
          </Link>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-black text-[#101010] mb-1 sm:mb-2 line-clamp-1">
              {featuredSkill ? featuredSkill.title : 'Reusable AI Agent Skills'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-4 sm:mb-6 leading-relaxed line-clamp-2">
              {featuredSkill?.description ||
                'Executable multi-step instruction packs for Claude Code, Cursor, Codex, and Gemini CLI agents.'}
            </p>
            <Link
              href={featuredSkill ? `/skills/${featuredSkill.id}` : '/skills'}
              className="pill-btn w-full py-2.5 sm:py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{featuredSkill ? 'Open Agent Skill' : 'Explore Skills'}</span>
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D8F651]" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export function TrendingPromptsSection() {
  const { prompts } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');

  const filtered = prompts
    .filter((p) => (activeTab === 'all' ? true : p.type === activeTab))
    .slice(0, 8);

  if (prompts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-[#F2EFE8] border-y border-[#E8E4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF4B26]" />
              <h2 className="text-3xl font-black text-[#101010]">
                Trending Right Now
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8A867D] mt-1">
              The highest-copied prompts across image and video generators this week.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-[#E8E4DA] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#101010] text-[#D8F651]'
                  : 'text-[#8A867D] hover:text-[#101010]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'image'
                  ? 'bg-[#101010] text-[#D8F651]'
                  : 'text-[#8A867D] hover:text-[#101010]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-[#101010] text-[#D8F651]'
                  : 'text-[#8A867D] hover:text-[#101010]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          </div>
        </div>

        {/* Trending Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>

        {/* View Catalog Link */}
        <div className="mt-12 text-center">
          <Link
            href="/prompts/image"
            className="pill-btn inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F7F4EE] text-[#101010] font-black text-xs sm:text-sm rounded-full border border-[#E8E4DA] shadow-sm"
          >
            <span>View Complete Prompt Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export function PopularCategoriesSection() {
  const { categories: storeCategories } = useAppStore();
  const displayCategories = storeCategories && storeCategories.length > 0 ? storeCategories : CATEGORIES;

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#8A867D]">
            VISUAL DISCOVERY
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#101010] mt-1">
            Popular Categories
          </h2>
        </div>
        <Link
          href="/categories"
          className="text-xs sm:text-sm font-bold text-[#101010] hover:underline flex items-center gap-1"
        >
          <span>View All {displayCategories.length} Categories</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayCategories.slice(0, 12).map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </section>
  );
}
