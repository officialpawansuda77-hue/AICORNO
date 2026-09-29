'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Check, Sparkles, ChevronDown, ShieldCheck, Zap, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@clerk/nextjs';

const PRICING_FAQS = [
  {
    q: 'How does the Free plan work?',
    a: 'The Free Explorer plan lets anyone create a free account, browse our entire catalog, save prompts to favorites, and copy all standard curated image and video prompts without paying anything.'
  },
  {
    q: 'What is the difference between Starter ($4.49) and Pro ($9.99)?',
    a: 'Starter ($4.49/mo) gives you unlimited copying on ALL AI image prompts across Midjourney, Flux.1 Pro, and Nano Banana. Pro Unlimited ($9.99/mo) unlocks everything: all image prompts, cinematic video prompts (Veo 3, Kling 1.5, Sora), and full reusable AI Agent Skills with executable instruction packs.'
  },
  {
    q: 'How can I cancel or manage my subscription?',
    a: 'You can cancel anytime in 1 click! Click "Manage Billing" on this page or your user dashboard. All billing management, invoices, and cancellations are handled securely via the Dodo Payments customer portal.'
  },
  {
    q: 'Can I switch between Starter and Pro?',
    a: 'Yes, you can upgrade to Pro or switch plans anytime through the Dodo customer portal. We prevent duplicate active subscriptions so you are never double-billed.'
  },
  {
    q: 'What payment methods does Dodo Payments accept?',
    a: 'Dodo Payments supports all major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and localized payment rails in over 150+ countries.'
  },
  {
    q: 'When does my access activate?',
    a: 'Instantly! As soon as your payment succeeds on Dodo Payments, our verified webhook automatically updates your account privileges in real-time.'
  }
];

export default function PricingPage() {
  const { addToast, openUpgradeModal, currentUser } = useAppStore();
  const { getToken } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [workingPlan, setWorkingPlan] = useState<'starter' | 'pro' | 'portal' | null>(null);

  const beginBilling = async (path: 'checkout' | 'portal', plan?: 'starter' | 'pro') => {
    if (!currentUser) {
      if (typeof window !== 'undefined' && plan) {
        localStorage.setItem('aicorn_pending_plan', plan);
      }
      openUpgradeModal({ reason: 'signin' });
      return;
    }

    if (workingPlan) return;
    setWorkingPlan(path === 'portal' ? 'portal' : plan || 'pro');

    try {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch {}

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
      if (!response.ok || typeof result.url !== 'string') {
        throw new Error(result.error || 'Billing is temporarily unavailable.');
      }

      window.location.assign(result.url);
    } catch (error) {
      addToast({
        title: 'Billing notice',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
      setWorkingPlan(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>TRANSPARENT CREATOR PRICING</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#101010] tracking-tight leading-[1.1]">
            Keep your workflow <br />
            free of{' '}
            <span className="relative inline-block">
              AI slop
              <span className="absolute left-0 right-0 top-1/2 h-1 bg-[#FF4B26] -rotate-2 rounded"></span>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#8A867D] mt-5 font-medium max-w-xl mx-auto leading-relaxed">
            Curated prompts with camera specs, Kelvin lighting values, and executable agent skills. Choose a plan or start for free.
          </p>

          {/* Active Subscription Banner */}
          {currentUser && currentUser.membership !== 'free' && (
            <div className="mt-8 inline-flex items-center gap-3 p-2.5 px-5 rounded-full bg-[#D8F651]/20 border border-[#D8F651] text-[#101010] text-xs font-bold">
              <Zap className="w-4 h-4 text-[#101010]" />
              <span>
                You are currently on the{' '}
                <strong className="uppercase">{currentUser.membership === 'pro' ? 'Pro Unlimited ($9.99/mo)' : 'Starter ($4.49/mo)'}</strong> plan.
              </span>
              <button
                onClick={() => beginBilling('portal')}
                disabled={workingPlan !== null}
                className="pill-btn ml-2 px-3.5 py-1 rounded-full bg-[#101010] text-[#D8F651] text-[11px] font-black hover:bg-[#202020] transition-colors"
              >
                {workingPlan === 'portal' ? 'Opening Portal...' : 'Manage Billing'}
              </button>
            </div>
          )}
        </div>

        {/* 3 Pricing Cards: Free vs Starter vs Pro Unlimited */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-20 items-stretch">
          
          {/* 1. Free Explorer ($0 / forever) */}
          <div className="aicorn-card p-6 sm:p-8 flex flex-col justify-between relative bg-white border border-[#E8E4DA] hover:border-[#101010]/30 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black text-[#8A867D] uppercase tracking-wider block">
                  Free Pass
                </span>
                <span className="bg-[#F7F4EE] border border-[#E8E4DA] text-[#101010] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Free forever
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#101010] mb-3">
                Community Explorer
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$0</span>
                <span className="text-sm font-bold text-[#8A867D]">/ forever</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-6 font-medium leading-relaxed">
                Discover and copy standard curated prompts. Perfect for getting started.
              </p>

              <div className="space-y-3 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  { text: 'Copy all Free Image & Video Prompts', included: true },
                  { text: '1-click clipboard prompt copying', included: true },
                  { text: 'Search, styles & category filters', included: true },
                  { text: 'Save favorites to personal collection', included: true },
                  { text: 'Submit prompts to the community', included: true },
                  { text: 'Pro Image Prompts (Requires Starter)', included: false },
                  { text: 'Pro Video Prompts (Requires Pro)', included: false },
                  { text: 'AI Agent Skills (Requires Pro)', included: false },
                ].map((feat, i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${feat.included ? 'text-[#1A1A1A]' : 'text-[#8A867D]/50'}`}>
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${feat.included ? 'text-[#101010]' : 'text-[#8A867D]/30'}`} />
                    <span className={feat.included ? '' : 'line-through text-[#8A867D]/50'}>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) openUpgradeModal({ reason: 'signin' });
              }}
              disabled={currentUser?.membership === 'free'}
              className="pill-btn w-full mt-8 py-3.5 rounded-full bg-[#F7F4EE] hover:bg-[#EAE6DC] text-[#101010] font-extrabold text-xs transition-colors border border-[#E8E4DA] disabled:opacity-60"
            >
              {currentUser?.membership === 'free' ? 'Current Active Plan' : 'Start Free'}
            </button>
          </div>

          {/* 2. Starter Plan ($4.49/mo) */}
          <div className="aicorn-card p-6 sm:p-8 flex flex-col justify-between relative bg-white border border-[#E8E4DA] hover:border-[#101010]/30 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black text-[#8A867D] uppercase tracking-wider block">
                  Image Creators
                </span>
                <span className="bg-[#F7F4EE] border border-[#E8E4DA] text-[#101010] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Cancel anytime
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#101010] mb-3">
                Starter Creator
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$4.49</span>
                <span className="text-sm font-bold text-[#8A867D]">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-6 font-medium leading-relaxed">
                Unlimited copy on all premium Image Prompts (Midjourney, Flux.1 Pro, Nano Banana).
              </p>

              <div className="space-y-3 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  { text: 'Copy ALL Image Prompts (Unlimited)', included: true },
                  { text: 'Aspect ratios (16:9, 9:16, 1:1, 4:5)', included: true },
                  { text: 'Lighting & camera lens specifications', included: true },
                  { text: 'Photorealistic & luxury aesthetics', included: true },
                  { text: 'Browse curated image collections', included: true },
                  { text: 'Pro Video Prompts (Requires Pro)', included: false },
                  { text: 'AI Agent Skills (Requires Pro)', included: false },
                ].map((feat, i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${feat.included ? 'text-[#1A1A1A]' : 'text-[#8A867D]/50'}`}>
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${feat.included ? 'text-[#101010]' : 'text-[#8A867D]/30'}`} />
                    <span className={feat.included ? '' : 'line-through text-[#8A867D]/50'}>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => beginBilling('checkout', 'starter')}
              disabled={workingPlan !== null || currentUser?.membership === 'starter'}
              className="pill-btn w-full mt-8 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {workingPlan === 'starter' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Opening Dodo Checkout...</span>
                </span>
              ) : currentUser?.membership === 'starter' ? (
                'Current Active Plan'
              ) : (
                'Get Starter Access ($4.49/mo)'
              )}
            </button>
          </div>

          {/* 3. Pro Unlimited Plan ($9.99/mo - MOST POPULAR) */}
          <div className="aicorn-card p-6 sm:p-8 flex flex-col justify-between relative bg-white border-2 border-[#101010] shadow-xl md:-translate-y-2">
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
              <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mb-3">
                Pro Unlimited
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-[#101010]">$9.99</span>
                <span className="text-sm font-bold text-[#8A867D]">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-6 font-medium leading-relaxed">
                Complete unrestricted access to all image prompts, Pro video prompts, and AI Agent Skills.
              </p>

              <div className="space-y-3 text-xs text-[#1A1A1A] font-semibold border-t border-[#F0EDE6] pt-6">
                {[
                  'Unlimited copy on ALL Image Prompts',
                  'Unlimited copy on ALL Video Prompts (Veo 3, Kling, Sora)',
                  'Full access to all Reusable AI Agent Skills',
                  'Copy CLI & Web instruction packs (SKILL.md)',
                  'Commercial usage rights cleared',
                  'Early access to new Sora & Opus drops',
                  'Manage billing anytime in portal',
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
              disabled={workingPlan !== null || currentUser?.membership === 'pro'}
              className="pill-btn w-full mt-8 py-3.5 rounded-full bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {workingPlan === 'pro' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Opening Dodo Checkout...</span>
                </span>
              ) : currentUser?.membership === 'pro' ? (
                'Current Active Plan'
              ) : (
                <>
                  <span>Get Pro Unlimited ($9.99/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Trust Badges & Guarantee */}
        <div className="max-w-4xl mx-auto mb-16 p-6 rounded-3xl bg-white border border-[#E8E4DA] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-[#F7F4EE] flex items-center justify-center text-[#101010] shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101010]">Global Payments</h4>
                <p className="text-[11px] text-[#8A867D]">Cards, Apple Pay, Google Pay</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-[#D8F651]/30 flex items-center justify-center text-[#101010] shrink-0">
                <Zap className="w-5 h-5 text-[#101010]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101010]">Instant Activation</h4>
                <p className="text-[11px] text-[#8A867D]">Real-time webhook unlocks access</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-[#F7F4EE] flex items-center justify-center text-[#101010] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101010]">Cancel Anytime</h4>
                <p className="text-[11px] text-[#8A867D]">1-click cancellation in portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing FAQ Section */}
        <div className="max-w-4xl mx-auto pt-10 border-t border-[#E8E4DA]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-black text-[#101010]">
                Pricing <br />questions.
              </h3>
              <p className="text-xs text-[#8A867D] mt-2 leading-relaxed">
                Everything you need to know about our plans, billing, and cancellation policy.
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              {PRICING_FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E8E4DA] bg-white overflow-hidden transition-all"
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
