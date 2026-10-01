'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import PromptCard from '@/components/cards/PromptCard';
import SkillCard from '@/components/cards/SkillCard';
import { useAppStore } from '@/lib/store';
import { isUserAdmin } from '@/lib/authUtils';
import {
  LayoutDashboard,
  Heart,
  PlusCircle,
  Clock,
  Sparkles,
  Shield,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function UserDashboardPage() {
  const {
    currentUser,
    favorites,
    prompts,
    skills,
    submissions,
    recentCopies,
    setAuthModalOpen,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'submissions' | 'history'>('overview');
  const [billingBusy, setBillingBusy] = useState(false);

  const manageBilling = async () => {
    setBillingBusy(true);
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || typeof data.url !== 'string') throw new Error(data.error || 'Billing unavailable');
      window.location.assign(data.url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Billing unavailable');
      setBillingBusy(false);
    }
  };

  if (!currentUser) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#101010] text-[#D8F651] flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#101010] mb-2">Creator Dashboard</h2>
          <p className="text-xs text-[#8A867D] mb-6">
            Please sign in to view your saved collections, submission reviews, and copy history.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="pill-btn px-6 py-3 bg-[#101010] text-[#D8F651] font-bold text-xs rounded-full shadow-md"
          >
            Sign In to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  const savedPrompts = prompts.filter((p) => favorites.includes(p.id));
  const savedSkills = skills.filter((s) => favorites.includes(s.id));
  const userSubmissions = submissions.filter(
    (s) => s.submitted_by.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'admin'
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* User Profile Header Card */}
        <div className="bg-white rounded-[32px] border border-[#E8E4DA] p-6 sm:p-8 mb-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-18 h-18 rounded-2xl object-cover border-2 border-[#101010]"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-[#101010]">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#101010] text-white text-[10px] font-black uppercase tracking-wider">
                  {currentUser.role}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    currentUser.membership === 'pro' || currentUser.is_pro
                      ? 'bg-[#D8F651] text-[#101010]'
                      : currentUser.membership === 'starter'
                      ? 'bg-[#101010] text-[#D8F651]'
                      : 'bg-[#F7F4EE] text-[#8A867D] border border-[#E8E4DA]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {currentUser.membership === 'pro' || currentUser.is_pro
                      ? 'Pro Unlimited ($9.99/mo)'
                      : currentUser.membership === 'starter'
                      ? 'Starter Creator ($4.49/mo)'
                      : 'Free Explorer'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-[#8A867D] mt-0.5">
                {currentUser.handle} &bull; {currentUser.email} &bull; Joined {currentUser.joined_date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.has_billing_account && (
              <button onClick={manageBilling} disabled={billingBusy} className="pill-btn px-4 py-2.5 bg-[#F7F4EE] text-[#101010] font-bold text-xs rounded-full border border-[#E8E4DA] disabled:opacity-50">
                {billingBusy ? 'Opening...' : 'Manage Billing'}
              </button>
            )}
            <Link
              href="/submit"
              className="pill-btn px-4 py-2.5 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-extrabold text-xs rounded-full flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Prompt</span>
            </Link>

            {isUserAdmin(currentUser) && (
              <Link
                href="/admin"
                className="pill-btn px-4 py-2.5 bg-[#F7F4EE] hover:bg-[#E8E4DA] text-[#101010] font-bold text-xs rounded-full border border-[#E8E4DA] flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="aicorn-card p-5 bg-white">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">
              Prompts Saved
            </span>
            <div className="text-3xl font-black text-[#101010] mt-1">
              {savedPrompts.length}
            </div>
          </div>

          <div className="aicorn-card p-5 bg-white">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">
              Skills Saved
            </span>
            <div className="text-3xl font-black text-[#101010] mt-1">
              {savedSkills.length}
            </div>
          </div>

          <div className="aicorn-card p-5 bg-white">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">
              Submissions
            </span>
            <div className="text-3xl font-black text-[#101010] mt-1">
              {userSubmissions.length}
            </div>
          </div>

          <div className="aicorn-card p-5 bg-white">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">
              Recent Copies
            </span>
            <div className="text-3xl font-black text-[#101010] mt-1">
              {recentCopies.length}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 pb-6 border-b border-[#E8E4DA] mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            Saved Items ({savedPrompts.length + savedSkills.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            My Submissions ({userSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#101010] text-[#D8F651]'
                : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
            }`}
          >
            Recent Copies ({recentCopies.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Quick Favorites Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#101010]">
                  Your Saved Prompts
                </h3>
                <Link href="/favorites" className="text-xs font-bold text-[#101010] hover:underline">
                  View All ({savedPrompts.length}) &rarr;
                </Link>
              </div>

              {savedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {savedPrompts.slice(0, 3).map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-white rounded-3xl border border-[#E8E4DA] text-center text-xs text-[#8A867D]">
                  No saved prompts yet.
                </div>
              )}
            </div>

            {/* Submissions Status List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-[#101010]">
                  Recent Submissions Status
                </h3>
                <Link href="/submit" className="text-xs font-bold text-[#101010] hover:underline">
                  + Submit Another
                </Link>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8E4DA] divide-y divide-[#F0EDE6] overflow-hidden">
                {userSubmissions.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#101010]">{sub.title}</span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#F7F4EE] text-[#8A867D]">
                          {sub.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#8A867D] mt-0.5 line-clamp-1">{sub.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {sub.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full bg-[#FFF0D4] text-[#B45309] text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="px-3 py-1 rounded-full bg-[#E8F3EE] text-[#0F5132] text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full bg-[#FEECEC] text-[#FF4B26] text-xs font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Needs Revisions</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED ITEMS */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {savedPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
            {savedSkills.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        )}

        {/* TAB 3: SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {userSubmissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl border border-[#E8E4DA] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#101010] text-[#D8F651] text-[10px] font-black uppercase">
                        {sub.type}
                      </span>
                      <span className="text-xs font-bold text-[#8A867D]">{sub.category} &bull; {sub.model}</span>
                    </div>
                    <h4 className="text-lg font-black text-[#101010]">{sub.title}</h4>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    sub.status === 'approved' ? 'bg-[#E8F3EE] text-[#0F5132]' : 'bg-[#FFF0D4] text-[#B45309]'
                  }`}>
                    {sub.status === 'approved' ? 'Live in Gallery' : 'Pending Review'}
                  </span>
                </div>

                <p className="text-xs text-[#8A867D] mb-4">{sub.description}</p>
                <div className="p-3 bg-[#F7F4EE] rounded-xl text-xs font-mono text-[#101010]">
                  {sub.prompt}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: RECENT COPIES */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-[#E8E4DA] divide-y divide-[#F0EDE6] overflow-hidden">
            {recentCopies.length > 0 ? (
              recentCopies.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F7F4EE] flex items-center justify-center text-[#101010]">
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#101010]">{item.title}</h4>
                      <p className="text-[10px] text-[#8A867D]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Type: {item.type}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/prompts/${item.id}`}
                    className="text-xs text-[#101010] hover:underline font-bold"
                  >
                    View &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#8A867D]">
                No copy history recorded in this session.
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
