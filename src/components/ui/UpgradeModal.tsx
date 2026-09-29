'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles, Check, ArrowRight, Lock, Bot, Video, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@clerk/nextjs';

export default function UpgradeModal() {
  const { isUpgradeModalOpen, setUpgradeModalOpen, upgradeModalContext, addToast, currentUser, setAuthModalOpen } = useAppStore();
  const { getToken } = useAuth();
  const [working, setWorking] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const isSkill = upgradeModalContext?.reason === 'skill';
  const itemName = upgradeModalContext?.itemTitle || (isSkill ? 'Agent Skill' : 'Pro Prompt');

  const handleCheckout = async (plan: 'starter' | 'pro') => {
    if (!currentUser) {
      setUpgradeModalOpen(false);
      setAuthModalOpen(true);
      return;
    }
    if (working) return;
    setWorking(true);
    try {
      let token: string | null = null;
      try { token = await getToken(); } catch {}

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
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#E8E4DA] shadow-2xl p-6 sm:p-8 overflow-hidden text-[#101010]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D8F651] via-[#FF4B26] to-[#D8F651]" />

        {/* Close button */}
        <button
          onClick={() => setUpgradeModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors text-[#101010]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <img src="/logo.png" alt="AICORN" className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-[#101010]">AICORN PRO</span>
              <span className="bg-[#101010] text-[#D8F651] text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D8F651]" />
                <span>$9.99/mo</span>
              </span>
            </div>
            <p className="text-xs text-[#8A867D] font-medium">Unlock full platform capabilities</p>
          </div>
        </div>

        {/* Dynamic reason box */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E8E4DA] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#101010] flex items-center justify-center text-[#D8F651] shrink-0">
            {isSkill ? <Bot className="w-5 h-5 text-[#D8F651]" /> : <Lock className="w-5 h-5 text-[#D8F651]" />}
          </div>
          <div>
            <h4 className="text-sm font-black text-[#101010]">
              {isSkill ? 'Skills are Pro Exclusive' : 'Pro Prompt Locked'}
            </h4>
            <p className="text-xs text-[#8A867D] mt-0.5 leading-relaxed">
              {isSkill ? (
                <>
                  <strong className="text-[#101010]">{itemName}</strong> instruction packs and configs require the{' '}
                  <strong className="text-[#101010]">$9.99 Pro Unlimited</strong> plan. The $4.49 plan only includes image prompts.
                </>
              ) : (
                <>
                  <strong className="text-[#101010]">{itemName}</strong> is designated as a Pro Video Prompt. Upgrade to{' '}
                  <strong className="text-[#101010]">$9.99/mo</strong> to copy all Pro videos and Agent Skills.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Plan Comparison Highlights */}
        <div className="mb-6 space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-[#8A867D]">
            What you get with Pro Unlimited ($9.99/mo):
          </div>
          <div className="space-y-2">
            {[
              'Unlimited copy on ALL Image Prompts & Pro Video Prompts',
              'Full access to all Reusable AI Agent Skills (Claude Code, Cursor, Codex)',
              '1-click CLI & web instruction pack installation',
              'Commercial usage rights cleared for client & agency work',
              'Early access to new Sora, Veo 3 & Opus model drops',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A]">
                <div className="w-4 h-4 rounded-full bg-[#D8F651] flex items-center justify-center text-[#101010] shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleCheckout('pro')}
            disabled={working}
            className="pill-btn w-full py-3.5 bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-black text-sm rounded-full flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {working ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#D8F651]" />
                <span>Redirecting to Dodo Checkout...</span>
              </span>
            ) : (
              <>
                <span>Upgrade to Pro Unlimited ($9.99/mo)</span>
                <ArrowRight className="w-4 h-4 text-[#D8F651]" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs px-2 pt-1 text-[#8A867D]">
            <span>Need only image prompts?</span>
            <button
              onClick={() => handleCheckout('starter')}
              disabled={working}
              className="font-bold text-[#101010] hover:underline"
            >
              Choose $4.49/mo Starter Plan &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
