'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, RotateCcw } from 'lucide-react';
import { CATEGORIES, AI_MODELS } from '@/data/categoriesModels';
import { isCategoryMatch } from '@/lib/categories';

interface FilterSidebarProps {
  type: 'image' | 'video' | 'skill';
}

export default function FilterSidebar({ type }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';
  const selectedModel = searchParams.get('model') || '';
  const selectedStyle = searchParams.get('style') || '';
  const selectedRatio = searchParams.get('ratio') || '';
  const selectedPrice = searchParams.get('price') || '';
  const selectedDuration = searchParams.get('duration') || '';
  const selectedOutput = searchParams.get('output') || '';
  const selectedAgent = searchParams.get('agent') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // A new filter always starts at the first result page. Otherwise a
    // previous page selection can make a valid filter look empty.
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedModel ||
    selectedStyle ||
    selectedRatio ||
    selectedPrice ||
    selectedDuration ||
    selectedOutput ||
    selectedAgent
  );

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#101010]" />
          <h3 className="font-extrabold text-sm text-[#101010] uppercase tracking-wider">
            Filters
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-[#FF4B26] hover:underline font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
          Category
        </h4>
        <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              !selectedCategory
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const active = isCategoryMatch(selectedCategory, cat.name) || isCategoryMatch(selectedCategory, cat.slug);
            return (
              <button
                key={cat.slug}
                onClick={() => updateFilter('category', cat.name)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#101010] text-[#D8F651]'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AI Model Filter (for image & video) */}
      {type !== 'skill' && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
            AI Model
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateFilter('model', '')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                !selectedModel
                  ? 'bg-[#101010] text-[#D8F651]'
                  : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
              }`}
            >
              All Models
            </button>
            {AI_MODELS.filter((m) =>
              type === 'video'
                ? m.type === 'video' || m.type === 'multimodal'
                : m.type === 'image' || m.type === 'multimodal'
            ).map((model) => (
              <button
                key={model.id}
                onClick={() => updateFilter('model', model.name)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedModel === model.name
                    ? 'bg-[#101010] text-[#D8F651]'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Style Filter */}
      {type !== 'skill' && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
            Style
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['Cinematic', 'Photorealistic', 'Editorial', 'Minimal', 'Luxury', '3D', 'Anime', 'Commercial', 'UGC'].map(
              (style) => (
                <button
                  key={style}
                  onClick={() => updateFilter('style', style)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedStyle === style
                      ? 'bg-[#101010] text-[#D8F651]'
                      : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                  }`}
                >
                  {style}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* 4. Aspect Ratio Filter */}
      {type !== 'skill' && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
            Aspect Ratio
          </h4>
          <div className="grid grid-cols-3 gap-1.5">
            {['16:9', '9:16', '1:1', '4:5', '3:4'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => updateFilter('ratio', ratio)}
                className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                  selectedRatio === ratio
                    ? 'bg-[#101010] text-[#D8F651]'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Video Duration Filter (if video) */}
      {type === 'video' && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
            Duration
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['5s', '8s', '10s', '15s', '30s'].map((dur) => (
              <button
                key={dur}
                onClick={() => updateFilter('duration', dur)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  selectedDuration === dur
                    ? 'bg-[#101010] text-[#D8F651]'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Agent Compatibility Filter (if skill) */}
      {type === 'skill' && (
        <>
          <div>
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
              Compatible Agent
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Claude Code', 'Cursor', 'Gemini CLI', 'ChatGPT', 'Codex'].map((agent) => (
                <button
                  key={agent}
                  onClick={() => updateFilter('agent', agent)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedAgent === agent
                      ? 'bg-[#101010] text-[#D8F651]'
                      : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                  }`}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
              Output Format
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Research', 'Code', 'Websites', 'Content', 'Data', 'Video'].map((out) => (
                <button
                  key={out}
                  onClick={() => updateFilter('output', out)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedOutput === out
                      ? 'bg-[#101010] text-[#D8F651]'
                      : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                  }`}
                >
                  {out}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 7. Access / Pricing Filter */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2.5">
          Access Tier
        </h4>
        <div className="flex gap-2">
          {['free', 'pro'].map((price) => (
            <button
              key={price}
              onClick={() => updateFilter('price', price)}
              className={`flex-1 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                selectedPrice === price
                  ? 'bg-[#101010] text-[#D8F651]'
                  : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
              }`}
            >
              {price}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
