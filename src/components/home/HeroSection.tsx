'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Bot, Video, Image as ImageIcon, Flame } from 'lucide-react';
import { AI_MODELS } from '@/data/categoriesModels';

const MARQUEE_ROW_1 = [
  { title: 'Supercar Neon Cyber Rain', tag: 'Automotive', model: 'Flux Pro', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop' },
  { title: 'Luxury Skincare Serum Macro', tag: 'Product Ads', model: 'Nano Banana', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop' },
  { title: 'Haute Couture Silk Billow', tag: 'Fashion', model: 'Midjourney v6', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
  { title: 'Iridescent Glassmorphic 3D Spheres', tag: '3D Render', model: 'Veo 3', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { title: 'Brutalist Nordic Pine Villa', tag: 'Architecture', model: 'Midjourney v6', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop' },
  { title: 'Michelin Star Berry Gastronomy', tag: 'Food', model: 'Nano Banana', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop' },
  { title: 'Oia Santorini Private Caldera Pool', tag: 'Travel', model: 'Flux Pro', img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop' },
  { title: 'Mechanical Optical Lens Disassembly', tag: '3D Motion', model: 'Veo 3', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop' },
];

const MARQUEE_ROW_2 = [
  { title: 'Titanium Tourbillon Chronograph', tag: 'Luxury', model: 'Flux Pro', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop' },
  { title: 'UGC TikTok Skincare Water Splash', tag: 'UGC Ads', model: 'Nano Banana', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { title: 'Studio Ghibli Mountain Train Sunset', tag: 'Anime', model: 'Midjourney v6', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop' },
  { title: 'Tokyo Rain Shinjuku Alleyway', tag: 'Cinematic', model: 'Veo 3', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop' },
  { title: 'Matte Bone White Tech Headphones', tag: 'E-commerce', model: 'Gemini 2.0', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' },
  { title: 'Sprinter Athlete Explosion Chalk Dust', tag: 'Fitness', model: 'Flux Pro', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop' },
  { title: 'Liquid Chrome Cloth Fluid Simulation', tag: 'Motion', model: 'Sora', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { title: 'Manhattan Skyline Penthouse Golden Hour', tag: 'Real Estate', model: 'Midjourney v6', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop' },
];

export default function HeroSection() {
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
      <div className="mt-14 space-y-4 pause-hover overflow-hidden select-none">
        
        {/* Row 1 - moves left */}
        <div className="flex animate-marquee-left gap-4">
          {[...MARQUEE_ROW_1, ...MARQUEE_ROW_1].map((item, idx) => (
            <div
              key={`r1-${idx}`}
              className="w-56 sm:w-64 h-40 rounded-[22px] overflow-hidden bg-white border border-[#E8E4DA] shadow-sm relative group shrink-0"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-end text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#D8F651] text-[#101010]">
                    {item.tag}
                  </span>
                  <span className="text-[10px] font-bold text-white/90">
                    {item.model}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 - moves right */}
        <div className="flex animate-marquee-right gap-4">
          {[...MARQUEE_ROW_2, ...MARQUEE_ROW_2].map((item, idx) => (
            <div
              key={`row2-${idx}`}
              className="w-56 sm:w-64 h-40 rounded-[22px] overflow-hidden bg-white border border-[#E8E4DA] shadow-sm relative group shrink-0"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-end text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white text-[#101010]">
                    {item.tag}
                  </span>
                  <span className="text-[10px] font-bold text-[#D8F651]">
                    {item.model}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
