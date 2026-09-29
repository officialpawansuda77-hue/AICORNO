'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';
import { useAppStore } from '@/lib/store';
import { isCategoryMatch } from '@/lib/categories';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { prompts, skills } = useAppStore();

  const realPromptCount = prompts.filter(
    (p) => isCategoryMatch(p.category, category.name) || isCategoryMatch(p.category, category.slug)
  ).length;

  const realSkillCount = skills.filter(
    (s) =>
      isCategoryMatch(s.category, category.name) ||
      isCategoryMatch(s.category, category.slug) ||
      s.tags.some((t) => isCategoryMatch(t, category.name) || isCategoryMatch(t, category.slug))
  ).length;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="aicorn-card group relative block p-5 sm:p-6 overflow-hidden transition-all"
      style={{ backgroundColor: category.bg_color || '#FFFFFF' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Category Image Avatar */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-black/10">
          <img
            src={category.featured_image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="w-8 h-8 rounded-full bg-white/80 group-hover:bg-[#101010] group-hover:text-[#D8F651] flex items-center justify-center transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      <h3 className="text-lg font-black text-[#101010] mb-1 group-hover:underline">
        {category.name}
      </h3>
      <p className="text-xs text-[#1A1A1A]/70 line-clamp-2 mb-3 leading-relaxed">
        {category.description}
      </p>

      <div className="flex items-center gap-2 text-xs font-bold text-[#101010]">
        <span className="bg-white/90 px-2.5 py-1 rounded-full border border-black/5 shadow-2xs">
          {realPromptCount} {realPromptCount === 1 ? 'Prompt' : 'Prompts'}
        </span>
        <span className="text-[#8A867D]">&bull;</span>
        <span className="text-[#8A867D]">
          {realSkillCount} {realSkillCount === 1 ? 'Skill' : 'Skills'}
        </span>
      </div>
    </Link>
  );
}
