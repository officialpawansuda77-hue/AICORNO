'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Bot, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function HeroSection() {
  const { prompts } = useAppStore();

  const marqueeItems = useMemo(() => {
    return prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      tag: prompt.category,
      model: prompt.model,
      img: prompt.preview_url,
      href: `/prompts/${prompt.id}`,
    }));
  }, [prompts]);

  const marqueeRow1 = useMemo(() => {
    if (marqueeItems.length === 0) return [];
    const half = Math.max(1, Math.ceil(marqueeItems.length / 2));
    let base = marqueeItems.slice(0, half);
    if (base.length === 0) return [];
    while (base.length < 5 && base.length > 0) base = [...base, ...base];
    return [...base, ...base];
  }, [marqueeItems]);

  const marqueeRow2 = useMemo(() => {
    if (marqueeItems.length === 0) return [];
    const half = Math.ceil(marqueeItems.length / 2);
    let base = marqueeItems.slice(half);
    if (base.length === 0) base = marqueeItems;
    if (base.length === 0) return [];
    while (base.length < 5 && base.length > 0) base = [...base, ...base];
    return [...base, ...base];
  }, [marqueeItems]);

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-18 md:pb-24 border-b border-[#E8E4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Small Lime Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D8F651] text-[#101010] text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#101010]" />
          <span>AI PROMPT & AGENT SKILL GALLERY</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#101010] tracking-tight max-w-4xl mx-auto leading-[1.08] mb-6">
          Find the Prompt.{' '}
          <span className="scribble-accent">Create the Impossible.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-xl text-[#8A867D] max-w-2xl mx-auto font-medium leading-relaxed mb-8">
          Discover high-quality AI image prompts, video prompts and agent skills. Preview the result, copy what works, and start creating.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Link
            href="/prompts/image"
            className="pill-btn px-6 py-3.5 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-black text-sm rounded-full shadow-lg flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Browse Prompts</span>
            <ArrowRight className="w-4 h-4 text-[#D8F651]" />
          </Link>

          <Link
            href="/skills"
            className="pill-btn px-6 py-3.5 bg-white hover:bg-[#F7F4EE] text-[#101010] font-black text-sm rounded-full border border-[#E8E4DA] shadow-sm flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Explore Skills</span>
          </Link>
        </div>

        {/* WORKS WITH Circular Model Pills */}
        <div className="pt-2">
          <p className="text-xs uppercase tracking-widest font-extrabold text-[#8A867D] mb-4">
            WORKS WITH SOTA GENERATIVE MODELS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto">
            {['Veo 3', 'Kling 1.5', 'OpenAI Sora', 'Midjourney v6.1', 'Nano Banana', 'Runway Gen-3', 'Flux.1 Pro', 'Gemini 2.0', 'Seedance', 'Claude Code'].map(
              (model) => (
                <span
                  key={model}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4DA] text-xs font-bold text-[#1A1A1A] hover:border-[#101010] transition-colors shadow-2xs"
                >
                  {model}
                </span>
              )
            )}
          </div>
        </div>

      </div>

      {/* TWO HORIZONTAL MARQUEE ROWS (Opposite directions, infinite calm loop, pause on hover) */}
      {marqueeItems.length > 0 && (
        <div className="relative mt-8 sm:mt-14 space-y-2.5 sm:space-y-4 pause-hover overflow-hidden select-none w-full max-w-full">
          {/* Subtle edge fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-[#FAF8F5] to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-[#FAF8F5] to-transparent z-20" />

          {/* Row 1 - moves left */}
          <div className="flex animate-marquee-left gap-2.5 sm:gap-4">
            {marqueeRow1.map((item, idx) => (
              <Link
                key={`r1-${idx}`}
                href={item.href}
                className="w-40 sm:w-56 md:w-64 h-24 sm:h-34 md:h-40 rounded-xl sm:rounded-[22px] overflow-hidden bg-white border border-[#E8E4DA] shadow-xs relative group shrink-0 cursor-pointer block"
              >
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-[#101010] flex items-center justify-center p-3">
                    <span className="text-[10px] sm:text-xs font-mono text-[#D8F651] truncate">{item.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-2.5 sm:p-3.5 flex flex-col justify-end text-left">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#D8F651] text-[#101010]">
                      {item.tag}
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-white/90">
                      {item.model}
                    </span>
                  </div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-white truncate">{item.title}</h4>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2 - moves right */}
          {marqueeRow2.length > 0 && (
            <div className="flex animate-marquee-right gap-2.5 sm:gap-4">
              {marqueeRow2.map((item, idx) => (
                <Link
                  key={`row2-${idx}`}
                  href={item.href}
                  className="w-40 sm:w-56 md:w-64 h-24 sm:h-34 md:h-40 rounded-xl sm:rounded-[22px] overflow-hidden bg-white border border-[#E8E4DA] shadow-xs relative group shrink-0 cursor-pointer block"
                >
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#101010] flex items-center justify-center p-3">
                      <span className="text-[10px] sm:text-xs font-mono text-[#D8F651] truncate">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-2.5 sm:p-3.5 flex flex-col justify-end text-left">
                    <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                      <span className="text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-white text-[#101010]">
                        {item.tag}
                      </span>
                      <span className="text-[8px] sm:text-[10px] font-bold text-[#D8F651]">
                        {item.model}
                      </span>
                    </div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-white truncate">{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
