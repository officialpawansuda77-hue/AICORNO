'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Check, Sparkles, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@clerk/nextjs';

const PRICING_FAQS = [
  {
    q: 'How can I cancel my subscription?',
    a: 'Sign in and open Manage Billing on this page or your dashboard. Cancellation and billing details are handled in the secure Dodo Payments customer portal.'
  },
  {
    q: 'What is included in Starter and Pro?',
    a: 'Starter unlocks premium image prompt copying. Pro also unlocks premium video prompt copying and skill instruction packs. Free prompts remain available to everyone.'
  },
  {
    q: 'Can I change plans?',
    a: 'Manage your current subscription in the billing portal before starting a different plan. We prevent a second active subscription to avoid double billing.'
  },
  {
    q: 'When does my access start?',
    a: 'Access updates after Dodo confirms your active subscription through a verified webhook. A checkout redirect alone does not activate a plan.'
  }
];

export default function PricingPage() {
  const { addToast, setAuthModalOpen, currentUser } = useAppStore();
  const { getToken } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [working, setWorking] = useState(false);

  const beginBilling = async (path: 'checkout' | 'portal', plan?: 'starter' | 'pro') => {
    if (!currentUser) { setAuthModalOpen(true); return; }
    if (working) return;
    setWorking(true);
    try {
      let token: string | null = null;
      try { token = await getToken(); } catch {}

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/billing/${path}`, {
        method: 'POST',
        headers,
        body: path === 'checkout'
          ? JSON.stringify({
              plan,
              userId: currentUser.id,
              email: currentUser.email,
              name: currentUser.name,
            })
          : JSON.stringify({ userId: currentUser.id }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.url !== 'string') throw new Error(result.error || 'Billing is unavailable.');
      window.location.assign(result.url);
    } catch (error) {
      addToast({ title: 'Billing unavailable', message: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
      setWorking(false);
    }
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

          <p className="text-xs font-bold text-[#1A1A1A] mt-6">Secure checkout powered by Dodo Payments</p>
          {currentUser?.has_billing_account && (
            <button onClick={() => beginBilling('portal')} disabled={working} className="mt-4 pill-btn px-5 py-2.5 rounded-full bg-[#101010] text-[#D8F651] text-xs font-bold disabled:opacity-50">
              Manage Billing
            </button>
          )}
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
                Copy premium image prompts; free prompts and standard videos remain available to everyone.
              </p>

              <div className="space-y-3.5 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  { text: 'Copy premium Image Prompts (Unlimited)', included: true },
                  { text: 'Browse free Image & standard Video Prompts', included: true },
                  { text: 'One-click clipboard prompt copying', included: true },
                  { text: 'Advanced search, styles & ratio filters', included: true },
                  { text: 'Browse the current prompt collection', included: true },
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
              onClick={() => beginBilling('checkout', 'starter')}
              disabled={working || !!currentUser && currentUser.membership !== 'free'}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-white font-extrabold text-xs shadow-md transition-all"
            >
              {working ? 'Opening billing...' : currentUser?.membership !== 'free' && currentUser ? 'Manage current plan above' : 'Get Starter Access ($4.49/mo)'}
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
                  'Unlimited copy on ALL Video Prompts (including Pro)',
                  'Full access to all Reusable AI Agent Skills',
                  'Copy CLI & Web instruction pack instructions',
                  'Download available SKILL.md instruction packs',
                  'Browse curated prompts and skills',
                  'Manage subscription in the billing portal'
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#101010] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => beginBilling('checkout', 'pro')}
              disabled={working || !!currentUser && currentUser.membership !== 'free'}
              className="pill-btn w-full mt-10 py-3.5 rounded-full bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs shadow-lg transition-transform active:scale-95"
            >
              {working ? 'Opening billing...' : currentUser?.membership !== 'free' && currentUser ? 'Manage current plan above' : 'Get Pro Unlimited ($9.99/mo)'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#8A867D] mb-10">Final price, taxes, billing interval and cancellation terms are shown at checkout. No access is granted until payment is confirmed.</p>

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
