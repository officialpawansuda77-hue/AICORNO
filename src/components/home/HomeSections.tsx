'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Video, Image as ImageIcon, Bot, Flame, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CATEGORIES } from '@/data/categoriesModels';
import PromptCard from '@/components/cards/PromptCard';
import CategoryCard from '@/components/cards/CategoryCard';

export function ExploreSection() {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Card 1: Image Prompts */}
        <div className="aicorn-card overflow-hidden flex flex-col justify-between group">
          <div className="relative h-64 overflow-hidden bg-[#EDEDEA]">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop"
              alt="Image Prompts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-[#101010] flex items-center gap-1.5 shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-[#101010]" />
              <span>IMAGE PROMPTS</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-black text-[#101010] mb-2">
              Visual AI Image Prompts
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-6 leading-relaxed">
              Curated photorealistic, minimal, and editorial prompts for Midjourney, Flux.1 Pro, and Nano Banana.
            </p>
            <Link
              href="/prompts/image"
              className="pill-btn w-full py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore Image Prompts</span>
              <ArrowRight className="w-4 h-4 text-[#D8F651]" />
            </Link>
          </div>
        </div>

        {/* Card 2: Video Prompts */}
        <div className="aicorn-card overflow-hidden flex flex-col justify-between group">
          <div className="relative h-64 overflow-hidden bg-[#EDEDEA]">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
              alt="Video Prompts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-[#101010] px-3 py-1 rounded-full text-xs font-black text-[#D8F651] flex items-center gap-1.5 shadow-sm">
              <Video className="w-3.5 h-3.5 text-[#D8F651]" />
              <span>VIDEO PROMPTS</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/80 text-white font-mono text-xs px-2 py-0.5 rounded">
              Veo 3 &bull; Sora &bull; Kling
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-black text-[#101010] mb-2">
              Cinematic AI Video Prompts
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-6 leading-relaxed">
              Commercial camera directions, FPV drone swoops, lighting specs, and motion prompts for Veo 3, Kling, and Sora.
            </p>
            <Link
              href="/prompts/video"
              className="pill-btn w-full py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore Video Prompts</span>
              <ArrowRight className="w-4 h-4 text-[#D8F651]" />
            </Link>
          </div>
        </div>

        {/* Card 3: AI Agent Skills */}
        <div className="aicorn-card overflow-hidden flex flex-col justify-between group">
          <div className="relative h-64 overflow-hidden bg-[#EDEDEA]">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
              alt="Agent Skills"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-[#D8F651] text-[#101010] px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-[#101010]" />
              <span>AGENT SKILLS</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-black text-[#101010] mb-2">
              Reusable AI Agent Skills
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-6 leading-relaxed">
              Executable multi-step instruction packs for Claude Code, Cursor, Codex, and Gemini CLI agents.
            </p>
            <Link
              href="/skills"
              className="pill-btn w-full py-3 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore Skills</span>
              <ArrowRight className="w-4 h-4 text-[#D8F651]" />
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
