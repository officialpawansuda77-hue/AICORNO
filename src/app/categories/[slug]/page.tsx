'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import PromptCard from '@/components/cards/PromptCard';
import SkillCard from '@/components/cards/SkillCard';
import { useAppStore } from '@/lib/store';
import { CATEGORIES } from '@/data/categoriesModels';
import { Video, Image as ImageIcon, Bot } from 'lucide-react';
import { normalizeCategoryName } from '@/lib/categories';

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { prompts, skills, categories: storeCategories } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'skills'>('all');

  const allCategories = storeCategories && storeCategories.length > 0 ? storeCategories : CATEGORIES;
  const category = allCategories.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase() === slug.toLowerCase()
  );

  // Resolve the route and every stored prompt to the same canonical value.
  // This is intentionally an exact comparison: /categories/anime must query
  // the same "Anime & Illustration" value stored on the Ghibli prompt.
  const catName = normalizeCategoryName(category?.name || slug);
  const categoryPrompts = prompts.filter(
    (p) => normalizeCategoryName(p.category) === catName
  );

  const categorySkills = skills.filter(
    (s) =>
      normalizeCategoryName(s.category) === catName ||
      s.tags.some((t) => normalizeCategoryName(t) === catName)
  );

  const filteredImagePrompts = categoryPrompts.filter((p) => p.type === 'image');
  const filteredVideoPrompts = categoryPrompts.filter((p) => p.type === 'video');

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A867D] mb-6">
          <Link href="/" className="hover:text-[#101010]">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-[#101010]">Categories</Link>
          <span>/</span>
          <span className="text-[#101010] font-bold capitalize">{catName}</span>
        </div>

        {/* Category Hero Banner */}
        <div
          className="rounded-[32px] p-8 sm:p-12 mb-10 border border-[#E8E4DA] relative overflow-hidden"
          style={{ backgroundColor: category?.bg_color || '#F4ECE1' }}
        >
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-xs uppercase tracking-widest font-black text-[#101010] mb-2 px-3 py-1 rounded-full bg-white/80">
              CATEGORY DISCOVERY
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight uppercase">
              {catName}
            </h1>
            <p className="text-sm sm:text-base text-[#1A1A1A]/80 mt-3 font-medium leading-relaxed">
              {category?.description || `Explore curated AI prompts and agent skills engineered for ${catName} creators.`}
            </p>

            <div className="flex items-center gap-3 mt-6 text-xs font-bold text-[#101010]">
              <span className="bg-white px-3 py-1.5 rounded-full shadow-2xs">
                {categoryPrompts.length} Prompts Total
              </span>
              <span className="bg-white px-3 py-1.5 rounded-full shadow-2xs">
                {categorySkills.length} Agent Skills
              </span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-2 pb-6 border-b border-[#E8E4DA] mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            All Items ({categoryPrompts.length + categorySkills.length})
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'image'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Prompts ({filteredImagePrompts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Prompts ({filteredVideoPrompts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Skills ({categorySkills.length})</span>
          </button>
        </div>

        {/* Grid display */}
        {activeTab === 'skills' ? (
          categorySkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {categorySkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#E8E4DA]">
              <p className="text-sm font-bold text-[#101010]">No skills currently tagged in this category.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {activeTab === 'all' && (
              <>
                {categoryPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
                {categorySkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </>
            )}
            {activeTab === 'image' &&
              filteredImagePrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            {activeTab === 'video' &&
              filteredVideoPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
