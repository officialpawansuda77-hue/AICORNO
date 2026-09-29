'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CategoryCard from '@/components/cards/CategoryCard';
import { CATEGORIES } from '@/data/categoriesModels';
import { useAppStore } from '@/lib/store';
import { Folder, Sparkles } from 'lucide-react';

export default function CategoriesPage() {
  const { categories: storeCategories } = useAppStore();
  const displayCategories = storeCategories && storeCategories.length > 0 ? storeCategories : CATEGORIES;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Folder className="w-3.5 h-3.5" />
            <span>VISUAL DISCOVERY TAXONOMY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            Browse by Category
          </h1>

          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium leading-relaxed">
            Find tailored AI image prompts, video sequences, and agent workflows categorized across {displayCategories.length} specialized creative disciplines.
          </p>
        </div>

        {/* Large Pastel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {displayCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
