'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Check, Sparkles, HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const PRICING_FAQS = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel your Monthly or Yearly plan at any time with a single click from your user dashboard. You will retain access until the end of your billing cycle.'
  },
  {
    q: 'What is included in the Lifetime plan?',
    a: 'Lifetime provides perpetual access to all current and future Premium image prompts, video prompts, and AI agent skills without any recurring subscription fees.'
  },
  {
    q: 'Do I get access to the install instruction packs for Claude Code and Cursor?',
    a: 'Yes, all Pro and Lifetime members receive full access to our downloadable SKILL.md instruction files and one-click copy install prompts.'
  },
  {
    q: 'Can I use the generated prompts for commercial client work?',
    a: 'Absolutely. All prompts and skill workflows in AICORN are cleared for unlimited commercial, agency, and personal usage with zero royalty requirements.'
  },
  {
    q: 'How frequently are new prompts and skills added?',
    a: 'Our curatorial team tests and releases 15 to 25 verified prompts and agent skills every week as new foundation models and updates launch.'
  }
];

export default function PricingPage() {
  const { addToast, setAuthModalOpen } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSelectPlan = (planName: string) => {
    addToast({
      title: `${planName} Plan Selected`,
      message: 'Checkout simulation active. You have full Pro access in this demo!',
      type: 'success',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        
        {/* Header Section Matching Reference Image 2 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-6xl font-black text-[#101010] tracking-tight leading-tight">
            Keep your agent <br />
            free of{' '}
            <span className="relative inline-block">
              AI slop
              <span className="absolute left-0 right-0 top-1/2 h-1 bg-[#FF4B26] -rotate-2 rounded"></span>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#8A867D] mt-4 font-medium flex items-center justify-center gap-2 flex-wrap">
            <span>Join people building with better Skills</span>
            <span>&bull;</span>
            <span className="text-[#101010] font-bold">Curated and reviewed in-house</span>
          </p>

          {/* Avatar Pile (Matching Reference) */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex -space-x-2 overflow-hidden">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
              ].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Member"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#1A1A1A]">
              1,000+ creators and engineers supporting us
            </span>
          </div>
        </div>

        {/* Three Pricing Cards Matching Reference Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-20 items-stretch">
          
          {/* 1. Monthly Plan */}
          <div className="aicorn-card p-8 flex flex-col justify-between relative bg-white">
            <div>
              <span className="text-xs font-extrabold text-[#8A867D] uppercase tracking-wider block mb-2">
                Cancel anytime
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mb-4">
                Monthly
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$9.99</span>
                <span className="text-sm font-bold text-[#8A867D]">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-8 font-medium">
                Full Premium access, billed monthly.
              </p>

              <div className="space-y-3.5 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  'Access all Premium Prompts & Skills',
                  'Install from the web or CLI',
                  'Unlimited one-click clipboard copying',
                  'Advanced parameter search filters',
                  'Ongoing weekly model updates',
                  'Cancel whenever you need'
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#101010] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Monthly')}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-white font-extrabold text-xs shadow-md transition-all"
            >
              Get Monthly Access
            </button>
          </div>

          {/* 2. Yearly Plan (MOST POPULAR - Lime Border & Badge) */}
          <div className="aicorn-card p-8 flex flex-col justify-between relative bg-white border-2 border-[#101010] shadow-xl md:-translate-y-2">
            {/* Badges */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black text-[#101010]">
                Save 34% a year
              </span>
              <span className="bg-[#D8F651] text-[#101010] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs">
                Most popular
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mb-4">
                Yearly
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$79</span>
                <span className="text-sm font-bold text-[#8A867D]">/ year</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-8 font-medium">
                Full Premium access for a lower annual price.
              </p>

              <div className="space-y-3.5 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  'Access all Premium Prompts & Skills',
                  'Install from the web or CLI',
                  'Secure browser-authorized CLI access',
                  'Ongoing Skill & Prompt updates',
                  'New Premium Skills included',
                  'Download SKILL.md and JSON configs',
                  'Cancel whenever you need'
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#101010] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Yearly')}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs shadow-lg transition-transform active:scale-95"
            >
              Get Yearly Pro
            </button>
          </div>

          {/* 3. Founding Lifetime Plan */}
          <div className="aicorn-card p-8 flex flex-col justify-between relative bg-white">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold text-[#8A867D] uppercase tracking-wider">
                Pay once &bull; Founding price
              </span>
              <span className="bg-[#F7F4EE] border border-[#E8E4DA] text-[#101010] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Founding offer
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mb-4">
                Founding Lifetime
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$169</span>
                <span className="text-sm font-bold text-[#8A867D]">one-time</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-8 font-medium">
                Founding price — increases as the library grows.
              </p>

              <div className="space-y-3.5 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  'Access all Premium Skills & Prompts forever',
                  'Install from the web or CLI',
                  'Secure browser-authorized CLI access',
                  'Ongoing lifetime updates',
                  'New future models included (Sora, Veo 4)',
                  'No subscription or renewal bill ever'
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#101010] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Lifetime')}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-white font-extrabold text-xs shadow-md transition-all"
            >
              Get Founding Lifetime
            </button>
          </div>

        </div>

        {/* Pricing FAQ Section (Matching Reference 2 bottom) */}
        <div className="max-w-4xl mx-auto pt-12 border-t border-[#E8E4DA]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-black text-[#101010]">
                Pricing <br />questions.
              </h3>
              <p className="text-xs text-[#8A867D] mt-2 leading-relaxed">
                Everything you need to know about our memberships and license terms.
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              {PRICING_FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E8E4DA] bg-white overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-bold text-sm text-[#101010] hover:bg-[#F7F4EE] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8A867D] transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4.5 pb-4 text-xs sm:text-sm text-[#8A867D] leading-relaxed border-t border-[#F0EDE6] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
