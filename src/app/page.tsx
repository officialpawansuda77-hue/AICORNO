import React from 'react';
import type { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import HeroSection from '@/components/home/HeroSection';
import {
  ExploreSection,
  TrendingPromptsSection,
  PopularCategoriesSection,
} from '@/components/home/HomeSections';
import FAQSection from '@/components/home/FAQSection';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function HomePage() {
  return (
    <AppLayout>
      {/* SECTION 1: HERO */}
      <HeroSection />

      {/* SECTION 2: EXPLORE THREE PILLARS (IMAGE, VIDEO, SKILLS) */}
      <ExploreSection />

      {/* SECTION 3: TRENDING PROMPTS CAROUSEL/GRID */}
      <TrendingPromptsSection />

      {/* SECTION 4: POPULAR CATEGORIES */}
      <PopularCategoriesSection />

      {/* SECTION 5: AICORN MANIFESTO CALLOUT */}
      <section className="py-16 sm:py-24 bg-[#101010] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D8F651] text-xs font-black uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>THE AICORN CREATOR STANDARD</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
            Keep your workflow free of <span className="text-[#FF4B26] line-through decoration-[#D8F651] decoration-4">AI slop</span>.
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Every prompt in our gallery is engineered with camera movements, Kelvin lighting values, and realistic optical constraints so you never have to guess.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/prompts/image"
              className="pill-btn px-6 py-3.5 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-sm rounded-full shadow-lg flex items-center gap-2"
            >
              <span>Start Discovering Now</span>
              <ArrowRight className="w-4 h-4 text-[#101010]" />
            </Link>
            <Link
              href="/blog/keep-your-creations-free-of-ai-slop"
              className="pill-btn px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-full transition-colors"
            >
              Read the Manifesto
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDION */}
      <FAQSection />
    </AppLayout>
  );
}
