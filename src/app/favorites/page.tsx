'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import PromptCard from '@/components/cards/PromptCard';
import SkillCard from '@/components/cards/SkillCard';
import { useAppStore } from '@/lib/store';
import { fetchUserFavoritesFromDb } from '@/lib/supabaseService';
import { Prompt } from '@/types';
import { Heart, Sparkles, Video, Image as ImageIcon, Bot, ArrowRight, RotateCcw } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, prompts, skills, currentUser, setAuthModalOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'skills'>('all');
  const [dbFavorites, setDbFavorites] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadFavs() {
      if (currentUser?.id) {
        setIsLoading(true);
        const favPrompts = await fetchUserFavoritesFromDb(currentUser.id);
        if (isMounted) {
          if (favPrompts.length > 0) {
            setDbFavorites(favPrompts);
          }
          setIsLoading(false);
        }
      }
    }
    loadFavs();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, favorites]);

  // Combine DB favorites with in-memory favorites for instant optimistic feedback
  const favoritedPrompts = [
    ...dbFavorites,
    ...prompts.filter((p) => favorites.includes(p.id) && !dbFavorites.some((df) => df.id === p.id)),
  ];

  const favoritedSkills = skills.filter((s) => favorites.includes(s.id));
  const favoritedImages = favoritedPrompts.filter((p) => p.type === 'image');
  const favoritedVideos = favoritedPrompts.filter((p) => p.type === 'video');

  const totalFavoritesCount = favoritedPrompts.length + favoritedSkills.length;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-[#E8E4DA]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-3">
              <Heart className="w-3.5 h-3.5 fill-[#FF4B26] text-[#FF4B26]" />
              <span>SUPABASE USER FAVORITES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#101010]">
              My Favorites ({totalFavoritesCount})
            </h1>
            <p className="text-xs sm:text-sm text-[#8A867D] mt-1 font-medium">
              Your personal cloud-synced library of bookmarked AI prompts and agent skills.
            </p>
          </div>

          {!currentUser && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="pill-btn px-4 py-2 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full self-start"
            >
              Sign In to Sync with Supabase
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            All Saved ({totalFavoritesCount})
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
            <span>Images ({favoritedImages.length})</span>
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
            <span>Videos ({favoritedVideos.length})</span>
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
            <span>Skills ({favoritedSkills.length})</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#101010] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-[#8A867D]">Syncing favorites with Supabase...</p>
          </div>
        ) : totalFavoritesCount === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-16 text-center max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-full bg-[#F7F4EE] flex items-center justify-center mx-auto mb-4 text-[#8A867D]">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#101010] mb-2">No saved favorites yet</h3>
            <p className="text-xs text-[#8A867D] mb-6 leading-relaxed">
              Explore the gallery and click the heart icon on any image, video, or skill to save it directly to your Supabase account.
            </p>
            <Link
              href="/prompts/image"
              className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="w-4 h-4 text-[#D8F651]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {activeTab === 'all' && (
              <>
                {favoritedPrompts.map((p) => (
                  <PromptCard key={p.id} prompt={p} />
                ))}
                {favoritedSkills.map((s) => (
                  <SkillCard key={s.id} skill={s} />
                ))}
              </>
            )}

            {activeTab === 'image' &&
              favoritedImages.map((p) => <PromptCard key={p.id} prompt={p} />)}

            {activeTab === 'video' &&
              favoritedVideos.map((p) => <PromptCard key={p.id} prompt={p} />)}

            {activeTab === 'skills' &&
              favoritedSkills.map((s) => <SkillCard key={s.id} skill={s} />)}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
