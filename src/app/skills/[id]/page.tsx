'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import SkillCard from '@/components/cards/SkillCard';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Copy,
  Check,
  Heart,
  Share2,
  Download,
  Terminal,
  Bot,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Code2,
  FileCode,
  Sliders,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { skills, getSkillById, toggleFavorite, isFavorite, incrementInstalls, addToast, openUpgradeModal, currentUser } = useAppStore();

  const skill = getSkillById(id);
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!skill) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-[#101010] mb-2">Skill Not Found</h2>
          <p className="text-sm text-[#8A867D] mb-6">The requested agent skill does not exist or has been relocated.</p>
          <Link
            href="/skills"
            className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Skills Catalog</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const favorited = isFavorite(skill.id);

  const handleCopyInstall = () => {
    if (!currentUser?.is_pro && currentUser?.role !== 'admin') {
      openUpgradeModal({
        reason: 'skill',
        itemTitle: skill.title,
      });
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(skill.install_prompt);
    }
    setCopied(true);
    incrementInstalls(skill.id);
    addToast({
      title: 'Skill Copied!',
      message: 'Full skill instruction pack copied to clipboard.',
      type: 'success',
    });

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D8F651', '#101010'],
      });
    } catch (e) {
      // safe fallback
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentUser?.is_pro && currentUser?.role !== 'admin') {
      openUpgradeModal({
        reason: 'skill',
        itemTitle: skill.title,
      });
      return;
    }

    const blob = new Blob([skill.install_prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKILL-${skill.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Skill Downloaded', message: 'Saved SKILL.md file.', type: 'info' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({ title: 'Link Copied!', message: 'Shareable skill URL copied to clipboard.', type: 'success' });
    }
  };

  const similarSkills = skills
    .filter((s) => s.id !== skill.id && s.category === skill.category)
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E4DA] text-xs font-semibold text-[#8A867D]">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#101010]">Home</Link>
            <span>/</span>
            <Link href="/skills" className="hover:text-[#101010]">Agent Skills</Link>
            <span>/</span>
            <span className="text-[#101010] font-bold">{skill.category}</span>
            <span>/</span>
            <span className="text-[#101010] font-bold truncate max-w-[200px]">{skill.title}</span>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#101010] hover:underline font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to skills</span>
          </button>
        </div>

        {/* TOP HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14">
          
          {/* LEFT: Preview / Architecture visual */}
          <div className="lg:col-span-7">
            <div className="rounded-[28px] overflow-hidden bg-[#101010] border border-[#E8E4DA] shadow-lg relative aspect-[16/10]">
              <img
                src={skill.preview_image}
                alt={skill.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-2">
                  <span className="bg-[#D8F651] text-[#101010] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    {skill.category} &bull; {skill.output_type}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                    {skill.installs.toLocaleString()} active installs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Information Card */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-[28px] border border-[#E8E4DA] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider">
                    {skill.output_type}
                  </span>
                  {skill.is_pro && (
                    <span className="px-2.5 py-1 rounded-full bg-[#FF4B26] text-white text-xs font-bold">
                      PRO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(skill.id)}
                    aria-label="Save skill"
                    className="p-2 rounded-full hover:bg-[#F7F4EE] text-[#1A1A1A] transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${favorited ? 'text-[#FF4B26] fill-[#FF4B26]' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share skill"
                    className="p-2 rounded-full hover:bg-[#F7F4EE] text-[#1A1A1A] transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#101010] leading-tight mb-2">
                {skill.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#8A867D] leading-relaxed font-medium mb-5">
                {skill.description}
              </p>

              {/* Compatible Agents */}
              <div className="p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] mb-6">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#8A867D] block mb-2">
                  Compatible AI Agents
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skill.compatible_agents.map((agent) => (
                    <span
                      key={agent}
                      className="px-2.5 py-1 rounded-full bg-white text-[#101010] text-xs font-bold border border-[#E8E4DA] shadow-2xs"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyInstall}
                  className={`pill-btn flex-1 py-3 text-xs font-black rounded-full flex items-center justify-center gap-2 transition-all shadow-md ${
                    copied
                      ? 'bg-[#101010] text-[#D8F651]'
                      : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Skill Copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Install Prompt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  aria-label="Download skill file"
                  className="p-3 rounded-full bg-[#F7F4EE] hover:bg-[#E8E4DA] text-[#101010] transition-colors border border-[#E8E4DA]"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0EDE6] flex items-center justify-between text-xs text-[#8A867D]">
                <span>★ {skill.rating || 5.0} Rating</span>
                <span>Verified Clean & Reproducible</span>
              </div>
            </div>
          </div>

        </div>

        {/* DEDICATED DARK CODE INSTALL BOX */}
        <div className="bg-[#101010] rounded-[28px] border border-white/10 p-6 sm:p-8 text-white mb-12 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#D8F651]" />
              <span className="font-mono text-xs uppercase tracking-wider font-extrabold text-[#D8F651]">
                INSTALL PROMPT & INSTRUCTION PACK
              </span>
            </div>
            <button
              onClick={handleCopyInstall}
              className="pill-btn flex items-center gap-1.5 px-4 py-1.5 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] text-xs font-black rounded-full"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied ✓' : 'Copy Instruction Pack'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-black/60 font-mono text-xs text-white/90 overflow-x-auto leading-relaxed max-h-96 selection:bg-[#D8F651] selection:text-[#101010]">
            <code>{skill.install_prompt}</code>
          </pre>
        </div>

        {/* WHAT THIS SKILL DOES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          
          {/* Capabilities */}
          <div className="lg:col-span-2 bg-white rounded-[28px] border border-[#E8E4DA] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#101010]" />
              <h3 className="text-xl font-black text-[#101010]">What This Skill Does</h3>
            </div>

            <div className="space-y-3 mb-8">
              {skill.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D8F651] fill-[#101010] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#1A1A1A] font-medium leading-relaxed">{cap}</p>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-black text-[#101010] uppercase tracking-wider mb-4">
              Execution Workflow
            </h4>
            <div className="space-y-3">
              {skill.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA]">
                  <span className="w-6 h-6 rounded-full bg-[#101010] text-[#D8F651] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-[#1A1A1A] font-medium leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration & Example */}
          <div className="space-y-6">
            {skill.config && skill.config.length > 0 && (
              <div className="bg-white rounded-[28px] border border-[#E8E4DA] p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8A867D] mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#101010]" />
                  <span>Configuration Variables</span>
                </h4>
                <div className="space-y-3">
                  {skill.config.map((c) => (
                    <div key={c.name} className="p-3 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs">
                      <div className="font-mono font-bold text-[#101010]">{c.name}</div>
                      <div className="text-[11px] text-[#8A867D] mt-0.5">{c.description}</div>
                      <div className="mt-1 font-mono text-[10px] text-[#FF4B26]">default: {c.default}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skill.example_usage && (
              <div className="bg-white rounded-[28px] border border-[#E8E4DA] p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8A867D] mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#101010]" />
                  <span>Example Terminal Trigger</span>
                </h4>
                <pre className="p-3 rounded-xl bg-[#101010] text-[#D8F651] font-mono text-xs overflow-x-auto">
                  <code>{skill.example_usage}</code>
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* FAQ SECTION */}
        {skill.faq && skill.faq.length > 0 && (
          <div className="bg-white rounded-[28px] border border-[#E8E4DA] p-6 sm:p-8 mb-14 shadow-sm">
            <h3 className="text-xl font-black text-[#101010] mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#101010]" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-3">
              {skill.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E8E4DA] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-[#F7F4EE] hover:bg-[#ECE8DF] transition-colors text-left font-bold text-xs sm:text-sm text-[#101010]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-[#8A867D] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIMILAR SKILLS */}
        {similarSkills.length > 0 && (
          <div className="pt-8 border-t border-[#E8E4DA]">
            <h3 className="text-2xl font-black text-[#101010] mb-6">
              Similar Agent Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarSkills.map((simSkill) => (
                <SkillCard key={simSkill.id} skill={simSkill} />
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
