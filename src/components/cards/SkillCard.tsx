'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Check, Heart, Terminal } from 'lucide-react';
import { Skill } from '@/types';
import { useAppStore } from '@/lib/store';
import confetti from 'canvas-confetti';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const router = useRouter();
  const { toggleFavorite, isFavorite, incrementInstalls, addToast } = useAppStore();
  const [copied, setCopied] = useState(false);

  const favorited = isFavorite(skill.id);

  const handleCopyInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(skill.install_prompt);
    }

    setCopied(true);
    incrementInstalls(skill.id);
    addToast({
      title: 'Skill Instructions Copied!',
      message: `Full instruction pack for "${skill.title}" copied to clipboard.`,
      type: 'success',
    });

    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#D8F651', '#101010'],
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(skill.id);
  };

  const formatInstalls = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div
      onClick={() => router.push(`/skills/${skill.id}`)}
      className="aicorn-card group relative flex flex-col overflow-hidden bg-white cursor-pointer"
    >
      {/* Visual Preview / Header Banner */}
      <div className="relative w-full h-48 overflow-hidden bg-[#101010]">
        <img
          src={skill.preview_image}
          alt={skill.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
        />

        {/* Favorite Icon */}
        <button
          onClick={handleFavorite}
          aria-label="Save skill to favorites"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 hover:bg-white backdrop-blur-md flex items-center justify-center text-[#1A1A1A] transition-all hover:scale-110 shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'text-[#FF4B26] fill-[#FF4B26]' : 'text-[#1A1A1A]'
            }`}
          />
        </button>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="bg-[#101010]/85 backdrop-blur-md text-[#D8F651] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Terminal className="w-3 h-3 text-[#D8F651]" />
            <span>AGENT SKILL</span>
          </span>
          {skill.is_pro && (
            <span className="bg-[#FF4B26] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              PRO
            </span>
          )}
        </div>

        {/* Category Pill on bottom banner */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            {skill.category.toLowerCase().trim() === skill.output_type.toLowerCase().trim()
              ? skill.category
              : `${skill.category} • ${skill.output_type}`}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-[#1A1A1A] text-lg leading-snug group-hover:text-black">
            {skill.title}
          </h3>

          <p className="text-xs text-[#8A867D] mt-1.5 font-medium leading-relaxed">
            {skill.description}
          </p>

          {/* Compatibility Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8A867D] mr-1">
              Works with:
            </span>
            {skill.compatible_agents.slice(0, 3).map((agent) => (
              <span
                key={agent}
                className="text-[10px] font-bold text-[#101010] bg-[#F7F4EE] px-2 py-0.5 rounded-full border border-[#E8E4DA]"
              >
                {agent}
              </span>
            ))}
            {skill.compatible_agents.length > 3 && (
              <span className="text-[10px] text-[#8A867D] font-bold">
                +{skill.compatible_agents.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between gap-2">
          {/* View Skill button */}
          <Link
            href={`/skills/${skill.id}`}
            onClick={(e) => e.stopPropagation()}
            className="pill-btn px-3.5 py-1.5 bg-[#F7F4EE] hover:bg-[#E8E4DA] text-[#101010] text-xs font-bold transition-all"
          >
            View Skill
          </Link>

          {/* Copy Install Prompt Button */}
          <button
            onClick={handleCopyInstall}
            className={`pill-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black transition-all ${
              copied
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Install</span>
              </>
            )}
          </button>

          <span className="text-[11px] font-semibold text-[#8A867D] hidden sm:inline">
            {formatInstalls(skill.installs)}{' '}installs
          </span>
        </div>
      </div>
    </div>
  );
}
