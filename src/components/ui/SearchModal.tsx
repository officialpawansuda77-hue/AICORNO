'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Video, Image as ImageIcon, Bot, Folder, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { fetchPromptsFromDb } from '@/lib/supabaseService';
import { CATEGORIES } from '@/data/categoriesModels';
import { isCategoryMatch } from '@/lib/categories';
import { Prompt } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { prompts, skills } = useAppStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'skills' | 'categories'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Prompt[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Global key listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Supabase search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      const clearTimer = setTimeout(() => {
        setSearchResults([]);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetchPromptsFromDb({
          search: q,
          limit: 12,
        });
        setSearchResults(res.prompts);
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredImagePrompts = searchResults.filter((p) => p.type === 'image');
  const filteredVideoPrompts = searchResults.filter((p) => p.type === 'video');

  const filteredSkills = skills
    .filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.compatible_agents.some((a) => a.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 4);

  const filteredCategories = CATEGORIES.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  ).slice(0, 6);

  const getCategoryPromptCount = (category: (typeof CATEGORIES)[number]) =>
    prompts.filter((prompt) => isCategoryMatch(prompt.category, category.name) || isCategoryMatch(prompt.category, category.slug)).length;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-[28px] border border-[#E8E4DA] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E4DA] bg-[#F7F4EE]/50">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-[#101010] animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-[#8A867D] shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts, skills & categories (e.g. 'cinematic car', 'veo 3', 'skincare')..."
            className="flex-1 bg-transparent text-base text-[#1A1A1A] placeholder:text-[#8A867D] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs bg-[#E8E4DA] hover:bg-[#DDD8CD] px-2 py-0.5 rounded-full text-[#1A1A1A]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8A867D] hover:text-[#1A1A1A] hover:bg-[#E8E4DA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#E8E4DA] bg-white overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#F7F4EE] text-[#8A867D] hover:text-[#1A1A1A]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'images'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#F7F4EE] text-[#8A867D] hover:text-[#1A1A1A]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Image Prompts
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'videos'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#F7F4EE] text-[#8A867D] hover:text-[#1A1A1A]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Video Prompts
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#F7F4EE] text-[#8A867D] hover:text-[#1A1A1A]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Agent Skills
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#F7F4EE] text-[#8A867D] hover:text-[#1A1A1A]'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            Categories
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-5">
          {/* Quick Suggestions if empty query */}
          {!query && (
            <div className="py-2">
              <p className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] mb-2 px-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {['Veo 3 cinematic car', 'Luxury skincare macro', 'YouTube research agent', 'Studio Ghibli sunset', 'Brutalist concrete architecture', 'Tactile ASMR switch'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="text-xs bg-[#F7F4EE] hover:bg-[#D8F651] hover:text-[#101010] text-[#1A1A1A] font-semibold px-3 py-1.5 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Image Prompts Section */}
          {(activeTab === 'all' || activeTab === 'images') && filteredImagePrompts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#101010]" /> Image Prompts ({filteredImagePrompts.length})
                </span>
                <Link
                  href="/prompts/image"
                  onClick={onClose}
                  className="text-xs text-[#1A1A1A] hover:underline font-bold"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredImagePrompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/prompts/${p.id}`)}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#F7F4EE] transition-all text-left border border-transparent hover:border-[#E8E4DA]"
                  >
                    <img
                      src={p.preview_url}
                      alt={p.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{p.title}</h4>
                      <p className="text-xs text-[#8A867D] truncate">
                        {p.category} &bull; <span className="text-[#101010] font-semibold">{p.model}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Prompts Section */}
          {(activeTab === 'all' || activeTab === 'videos') && filteredVideoPrompts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#101010]" /> Video Prompts ({filteredVideoPrompts.length})
                </span>
                <Link
                  href="/prompts/video"
                  onClick={onClose}
                  className="text-xs text-[#1A1A1A] hover:underline font-bold"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredVideoPrompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/prompts/${p.id}`)}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#F7F4EE] transition-all text-left border border-transparent hover:border-[#E8E4DA]"
                  >
                    <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={p.preview_url}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] text-[#D8F651] font-bold px-1 rounded">
                        {p.duration || '8s'}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{p.title}</h4>
                      <p className="text-xs text-[#8A867D] truncate">
                        {p.category} &bull; <span className="text-[#101010] font-semibold">{p.model}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent Skills Section */}
          {(activeTab === 'all' || activeTab === 'skills') && filteredSkills.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#101010]" /> AI Agent Skills ({filteredSkills.length})
                </span>
                <Link
                  href="/skills"
                  onClick={onClose}
                  className="text-xs text-[#1A1A1A] hover:underline font-bold"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="space-y-1.5">
                {filteredSkills.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/skills/${s.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F7F4EE] transition-all text-left border border-transparent hover:border-[#E8E4DA]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-[#101010] text-[#D8F651] flex items-center justify-center shrink-0 font-bold text-xs">
                        SK
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{s.title}</h4>
                        <p className="text-xs text-[#8A867D] truncate">
                          {s.category} &bull; {s.compatible_agents.join(', ')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8A867D] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {(activeTab === 'all' || activeTab === 'categories') && filteredCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#8A867D] flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[#101010]" /> Categories ({filteredCategories.length})
                </span>
                <Link
                  href="/categories"
                  onClick={onClose}
                  className="text-xs text-[#1A1A1A] hover:underline font-bold"
                >
                  Browse All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => handleSelect(`/categories/${c.slug}`)}
                    className="p-2.5 rounded-2xl bg-[#F7F4EE] hover:bg-[#ECE8DF] transition-colors text-left flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#101010]">{c.name}</h4>
                      <p className="text-[10px] text-[#8A867D]">{(() => { const n = getCategoryPromptCount(c); return `${n} prompt${n === 1 ? '' : 's'}`; })()}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A867D] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {query && !isSearching && filteredImagePrompts.length === 0 &&
            filteredVideoPrompts.length === 0 &&
            filteredSkills.length === 0 &&
            filteredCategories.length === 0 && (
              <div className="py-12 text-center text-[#8A867D]">
                <p className="text-sm font-bold text-[#1A1A1A] mb-1">No database results for &ldquo;{query}&rdquo;</p>
                <p className="text-xs">Try searching for styles, models like &ldquo;Veo 3&rdquo; or categories like &ldquo;Automotive&rdquo;.</p>
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 border-t border-[#E8E4DA] bg-[#F7F4EE]/60 flex items-center justify-between text-[11px] text-[#8A867D]">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-[#DDD8CD] rounded font-mono text-[10px] text-[#1A1A1A]">ESC</kbd> to exit</span>
            <span>Click any item to view</span>
          </div>
          <span className="font-semibold text-[#1A1A1A]">Instant search</span>
        </div>
      </div>
    </div>
  );
}
