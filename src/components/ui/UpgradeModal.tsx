'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Lock, Bot, ShieldCheck, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@clerk/nextjs';

export default function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    setUpgradeModalOpen,
    upgradeModalContext,
    addToast,
    currentUser,
    setAuthModalOpen,
  } = useAppStore();
  const { getToken } = useAuth();
  const [workingPlan, setWorkingPlan] = useState<'free' | 'starter' | 'pro' | null>(null);

  if (!isUpgradeModalOpen) return null;

  const isSkill = upgradeModalContext?.reason === 'skill';
  const isSignIn = upgradeModalContext?.reason === 'signin';
  const itemName = upgradeModalContext?.itemTitle || (isSkill ? 'Agent Skill' : 'Pro Prompt');

  // Handle plan selection
  const handleSelectPlan = async (plan: 'free' | 'starter' | 'pro') => {
    // 1. FREE PLAN
    if (plan === 'free') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aicorn_pending_plan');
      }
      setUpgradeModalOpen(false);
      if (!currentUser) {
        setAuthModalOpen(true);
      }
      return;
    }

    // 2. PAID PLANS (Starter $4.49 or Pro $9.99)
    if (!currentUser) {
      // User is not signed in: Save plan, close modal, open Clerk Sign-in
      if (typeof window !== 'undefined') {
        localStorage.setItem('aicorn_pending_plan', plan);
      }
      setUpgradeModalOpen(false);
      setAuthModalOpen(true);
      addToast({
        title: `Plan Selected: ${plan === 'pro' ? 'Pro Unlimited ($9.99/mo)' : 'Starter ($4.49/mo)'}`,
        message: 'Sign in to your account. You will automatically be redirected to secure checkout!',
        type: 'info',
      });
      return;
    }

    // User is already signed in: Start checkout immediately
    if (workingPlan) return;
    setWorkingPlan(plan);
    try {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch {}

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan,
          userId: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || typeof data.url !== 'string') {
        throw new Error(data.error || 'Checkout is currently unavailable.');
      }

      window.location.assign(data.url);
    } catch (err: any) {
      addToast({
        title: 'Checkout error',
        message: err?.message || 'Could not start Dodo checkout.',
        type: 'error',
      });
      setWorkingPlan(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={() => setUpgradeModalOpen(false)}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DA] shadow-2xl p-5 sm:p-8 my-auto overflow-hidden text-[#101010]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D8F651] via-[#FF4B26] to-[#D8F651]" />

        {/* Close button */}
        <button
          onClick={() => setUpgradeModalOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors text-[#101010] z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center max-w-xl mx-auto mb-8 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>{isSignIn ? 'CHOOSE YOUR AICORN PASS' : 'PREMIUM CREATOR ACCESS'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#101010] tracking-tight">
            {isSignIn ? 'Select your AICORN Plan' : isSkill ? `Unlock ${itemName}` : `Unlock Pro Video & Agent Skills`}
          </h2>

          <p className="text-xs sm:text-sm text-[#8A867D] mt-2 font-medium">
            {isSignIn
              ? 'Start for free or upgrade to copy curated AI image prompts, cinematic videos & autonomous agent skills.'
              : isSkill
              ? 'Agent skill instructions and YAML/JSON configurations require the Pro Unlimited plan.'
              : 'Choose the plan that fits your creative workflow. Cancel anytime with zero friction.'}
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6 items-stretch">
          
          {/* 1. Free Explorer ($0) */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 flex flex-col justify-between hover:border-[#101010]/30 transition-all shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#8A867D]">Community</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F4EE] text-[#101010] border border-[#E8E4DA]">Free</span>
              </div>
              <h3 className="text-lg font-black text-[#101010] mb-2">Explorer</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-[#101010]">$0</span>
                <span className="text-xs text-[#8A867D] font-bold">/ forever</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-5 font-medium leading-relaxed">
                Discover and copy standard curated prompts. Perfect for getting started.
              </p>

              <div className="space-y-2.5 text-xs text-[#1A1A1A] font-medium border-t border-[#F0EDE6] pt-4">
                {[
                  { text: 'Copy all Free Image & Video Prompts', included: true },
                  { text: '1-click clipboard prompt copy', included: true },
                  { text: 'Search, styles & category filters', included: true },
                  { text: 'Save favorites to your account', included: true },
                  { text: 'Pro Image Prompts (Requires Starter)', included: false },
                  { text: 'Pro Video Prompts (Requires Pro)', included: false },
                  { text: 'Agent Skills (Requires Pro)', included: false },
                ].map((feat, i) => (
                  <div key={i} className={`flex items-start gap-2 ${feat.included ? 'text-[#1A1A1A]' : 'text-[#8A867D]/50'}`}>
                    <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${feat.included ? 'text-[#101010]' : 'text-[#8A867D]/30'}`} />
                    <span className={feat.included ? 'font-semibold' : 'line-through text-[11px]'}>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full mt-6 py-3 rounded-full bg-[#F7F4EE] hover:bg-[#EAE6DC] text-[#101010] font-extrabold text-xs transition-colors border border-[#E8E4DA]"
            >
              {currentUser?.membership === 'free' ? 'Continue with Free' : 'Choose Free Explorer ($0)'}
            </button>
          </div>

          {/* 2. Starter Creator ($4.49/mo) */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 flex flex-col justify-between hover:border-[#101010]/30 transition-all shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#8A867D]">Images Only</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F4EE] text-[#101010] border border-[#E8E4DA]">Monthly</span>
              </div>
              <h3 className="text-lg font-black text-[#101010] mb-2">Starter Creator</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-[#101010]">$4.49</span>
                <span className="text-xs text-[#8A867D] font-bold">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-5 font-medium leading-relaxed">
                Unlimited copy on all Image Prompts (Midjourney, Flux, Nano Banana).
              </p>

              <div className="space-y-2.5 text-xs text-[#1A1A1A] font-medium border-t border-[#F0EDE6] pt-4">
                {[
                  { text: 'Copy ALL Image Prompts (Unlimited)', included: true },
                  { text: 'Full aspect ratio & style prompts', included: true },
                  { text: 'Photorealistic & luxury aesthetics', included: true },
                  { text: 'Browse curated collections', included: true },
                  { text: 'Cancel anytime in 1 click', included: true },
                  { text: 'Pro Video Prompts (Requires Pro)', included: false },
                  { text: 'Agent Skills (Requires Pro)', included: false },
                ].map((feat, i) => (
                  <div key={i} className={`flex items-start gap-2 ${feat.included ? 'text-[#1A1A1A]' : 'text-[#8A867D]/50'}`}>
                    <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${feat.included ? 'text-[#101010]' : 'text-[#8A867D]/30'}`} />
                    <span className={feat.included ? 'font-semibold' : 'line-through text-[11px]'}>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('starter')}
              disabled={workingPlan !== null}
              className="w-full mt-6 py-3 rounded-full bg-[#101010] hover:bg-[#252525] text-white font-extrabold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {workingPlan === 'starter' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting...</span>
                </span>
              ) : (
                'Choose Starter ($4.49/mo)'
              )}
            </button>
          </div>

          {/* 3. Pro Unlimited ($9.99/mo) - HERO CARD */}
          <div className="bg-white rounded-2xl border-2 border-[#101010] p-5 sm:p-6 flex flex-col justify-between shadow-xl relative md:-translate-y-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D8F651] text-[#101010] text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-[#101010]" />
              <span>MOST POPULAR • UNLIMITED</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#101010]">All-Access Pass</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D8F651] text-[#101010]">Full Suite</span>
              </div>
              <h3 className="text-lg font-black text-[#101010] mb-2">Pro Unlimited</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-[#101010]">$9.99</span>
                <span className="text-xs text-[#8A867D] font-bold">/ month</span>
              </div>
              <p className="text-xs text-[#8A867D] mb-5 font-medium leading-relaxed">
                Complete unrestricted access to ALL Image prompts, Pro Video prompts & Agent Skills.
              </p>

              <div className="space-y-2.5 text-xs text-[#101010] font-semibold border-t border-[#F0EDE6] pt-4">
                {[
                  'Unlimited copy on ALL Image Prompts',
                  'Unlimited copy on ALL Video Prompts (Veo 3, Kling, Sora)',
                  'Full access to ALL AI Agent Skills (Claude Code, Cursor)',
                  '1-click CLI & web instruction packs (SKILL.md)',
                  'Commercial usage rights cleared',
                  'Cancel anytime with zero fees',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#101010]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={workingPlan !== null}
              className="w-full mt-6 py-3 rounded-full bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {workingPlan === 'pro' ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Opening Dodo Payments...</span>
                </span>
              ) : (
                <>
                  <span>Get Pro Unlimited ($9.99/mo)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Trust & Guarantee Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E8E4DA] text-xs text-[#8A867D]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#101010]" />
            <span>Secure checkout powered by <strong>Dodo Payments</strong> (Apple Pay, Google Pay, Global Cards)</span>
          </div>

          {!currentUser && (
            <button
              onClick={() => {
                if (typeof window !== 'undefined') localStorage.removeItem('aicorn_pending_plan');
                setUpgradeModalOpen(false);
                setAuthModalOpen(true);
              }}
              className="font-bold text-[#101010] hover:underline"
            >
              Already have an account? Sign In directly &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
