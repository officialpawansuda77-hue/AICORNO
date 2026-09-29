'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import SkillCard from '@/components/cards/SkillCard';
import { useAppStore } from '@/lib/store';
import { Bot, SlidersHorizontal, X, Terminal } from 'lucide-react';

function SkillsCatalogContent() {
  const { skills } = useAppStore();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const selectedCategory = searchParams.get('category');
  const selectedOutput = searchParams.get('output');
  const selectedAgent = searchParams.get('agent');
  const selectedPrice = searchParams.get('price');
  const currentSort = searchParams.get('sort') || 'popular';
  const query = (searchParams.get('q') || '').toLowerCase().trim();

  let filtered = [...skills];

  if (selectedCategory) {
    filtered = filtered.filter(
      (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (selectedOutput) {
    filtered = filtered.filter(
      (s) => s.output_type.toLowerCase() === selectedOutput.toLowerCase()
    );
  }

  if (selectedAgent) {
    filtered = filtered.filter((s) =>
      s.compatible_agents.some((a) => a.toLowerCase().includes(selectedAgent.toLowerCase()))
    );
  }

  if (selectedPrice) {
    if (selectedPrice === 'pro') filtered = filtered.filter((s) => s.is_pro);
    if (selectedPrice === 'free') filtered = filtered.filter((s) => !s.is_pro);
  }

  if (query) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.compatible_agents.some((a) => a.toLowerCase().includes(query)) ||
        s.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    if (currentSort === 'copies' || currentSort === 'installs') return b.installs - a.installs;
    if (currentSort === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return b.installs - a.installs;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-3">
          <Terminal className="w-3.5 h-3.5 text-[#D8F651]" />
          <span>REUSABLE AI AGENT INSTRUCTION PACKS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
          AI Agent Skills
        </h1>
        <p className="text-sm sm:text-base text-[#8A867D] mt-2 max-w-2xl font-medium">
          Production-tested instruction packs for Claude Code, Cursor, Codex, and Gemini CLI agents. Copy, install, and execute immediately.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left Filter Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar type="skill" />
        </div>

        {/* Right Content */}
        <div className="flex-1 w-full">
          <CatalogToolbar
            totalCount={filtered.length}
            label="Agent Skills"
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          />

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filtered.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-12 text-center my-6">
              <h3 className="text-lg font-bold text-[#101010] mb-1">
                No agent skills found
              </h3>
              <p className="text-xs text-[#8A867D]">
                Try adjusting your compatibility or output filters.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA] mb-6">
              <h3 className="font-black text-sm uppercase">Filter Skills</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-full text-[#8A867D] hover:text-[#101010]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar type="skill" />
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="mt-8 w-full py-3 bg-[#101010] text-[#D8F651] font-bold text-xs rounded-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillsCatalogPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#8A867D]">Loading Agent Skills...</div>}>
        <SkillsCatalogContent />
      </Suspense>
    </AppLayout>
  );
}
