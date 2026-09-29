'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Check, Sparkles, HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const PRICING_FAQS = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel your Starter ($4.49/mo) or Pro Unlimited ($9.99/mo) plan at any time with a single click from your user dashboard. You retain access until the end of your billing cycle.'
  },
  {
    q: 'What is the difference between the $4.49 and $9.99 plans?',
    a: 'The $4.49 Starter plan includes unlimited access to copy all Image Prompts and standard video prompts. The $9.99 Pro Unlimited plan unlocks everything without limits: all Pro Video Prompts (Veo 3, Sora, Kling) and all AI Agent Skills (Claude Code, Cursor, Codex).'
  },
  {
    q: 'What happens if I try to copy a Pro Video Prompt or Skill on the Starter plan?',
    a: 'You will see a Pro Upgrade popup allowing you to upgrade to the $9.99/mo plan instantly to unlock that prompt or skill.'
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

        {/* Two Pricing Cards: $4.49 Starter vs $9.99 Pro Unlimited */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 items-stretch">
          
          {/* 1. Starter Plan ($4.49/mo) */}
          <div className="aicorn-card p-8 flex flex-col justify-between relative bg-white">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold text-[#8A867D] uppercase tracking-wider block">
                  Starter Plan
                </span>
                <span className="bg-[#F7F4EE] border border-[#E8E4DA] text-[#101010] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cancel anytime
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mb-4">
                Starter Creator
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$4.49</span>
                <span className="text-sm font-bold text-[#8A867D]">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-8 font-medium">
                Full unlimited access to all AI image prompts and standard video prompts.
              </p>

              <div className="space-y-3.5 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  { text: 'Copy & use ALL Image Prompts (Unlimited)', included: true },
                  { text: 'Access standard Video Prompts', included: true },
                  { text: 'One-click clipboard prompt copying', included: true },
                  { text: 'Advanced search, styles & ratio filters', included: true },
                  { text: 'Weekly trending prompt updates', included: true },
                  { text: 'Pro Video Prompts (Requires $9.99 Pro)', included: false },
                  { text: 'AI Agent Skills (Requires $9.99 Pro)', included: false },
                ].map((feat, i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${feat.included ? 'text-[#1A1A1A]' : 'text-[#8A867D]/60'}`}>
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${feat.included ? 'text-[#101010]' : 'text-[#8A867D]/40'}`} />
                    <span className={feat.included ? '' : 'line-through'}>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Starter ($4.49/mo)')}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-white font-extrabold text-xs shadow-md transition-all"
            >
              Get Starter Access ($4.49/mo)
            </button>
          </div>

          {/* 2. Pro Unlimited Plan ($9.99/mo - MOST POPULAR) */}
          <div className="aicorn-card p-8 flex flex-col justify-between relative bg-white border-2 border-[#101010] shadow-xl md:-translate-y-2">
            {/* Badges */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black text-[#101010]">
                Everything Unlimited
              </span>
              <span className="bg-[#D8F651] text-[#101010] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#101010]" />
                <span>Most popular</span>
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mb-4">
                Pro Unlimited
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$9.99</span>
                <span className="text-sm font-bold text-[#8A867D]">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-8 font-medium">
                Complete unrestricted access to all image prompts, Pro video prompts, and AI Agent Skills.
              </p>

              <div className="space-y-3.5 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  'Unlimited copy on ALL Image Prompts',
                  'Unlimited copy on ALL Video Prompts (including Pro & 4K)',
                  'Full access to all Reusable AI Agent Skills',
                  '1-click CLI & Web instruction pack install',
                  'Download SKILL.md and JSON configs',
                  'Commercial usage rights for agency & client work',
                  'Early access to new Sora, Veo 3 & Opus model drops',
                  'Cancel anytime with zero fees'
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#101010] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('Pro Unlimited ($9.99/mo)')}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs shadow-lg transition-transform active:scale-95"
            >
              Get Pro Unlimited ($9.99/mo)
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
