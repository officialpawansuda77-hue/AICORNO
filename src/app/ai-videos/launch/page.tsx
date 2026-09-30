'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Laptop,
  Music,
  Video,
  Layers,
  Code2,
  Wand2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import confetti from 'canvas-confetti';

const MANUS_SKILL_CODE = `---
name: manus-launch-video-generator
description: Autonomous Claude Opus 5.5 agent skill to research a website URL, extract product truth, write a kinetic storyboard, and render a 75-120s Manus 2.0 style launch film cut to the beat.
version: 2.1.0
model: claude-opus-5.5
---

# Manus 2.0 Launch Video Skill

## Workflow
1. Crawl the target product URL and extract core brand proposition, taglines, and UI features.
2. Structure a 4-act launch arc:
   - Act 1: The Problem / The Agitation (0-20s, Big kinetic sans-serif typography)
   - Act 2: The Breakthrough / First UI Reveal (20-50s, 3D frosted glass card on landscape plate)
   - Act 3: Feature Acceleration (50-85s, Real UI push-ins, micro-interactions, beat sync)
   - Act 4: "One More Thing" & CTA (85-120s, Dramatic reveal, audio climax, logo lockup)
3. Generate camera directives:
   - Lens: 35mm Anamorphic T1.5
   - Lighting: Warm volumetric key with frosted glass acrylic edge caustics
   - Easing: Custom cubic-bezier(0.16, 1, 0.3, 1) spring physics
4. Output format: 4K 60fps MP4 with synchronized 128 BPM electronic soundtrack.
`;

export default function LaunchVideoPage() {
  const { openUpgradeModal, currentUser, addToast } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [storyboardResult, setStoryboardResult] = useState<{
    brandName: string;
    hook: string;
    beats: string[];
  } | null>(null);

  const isUserPro = currentUser?.role === 'admin' || currentUser?.is_pro || currentUser?.membership === 'pro';

  const handleGetSkill = () => {
    if (!isUserPro) {
      openUpgradeModal({
        reason: 'skill',
        itemTitle: 'Manus 2.0 Launch Video Skill',
      });
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(MANUS_SKILL_CODE);
    }
    setCopiedCode(true);
    addToast({
      title: 'Skill Instruction Pack Copied!',
      message: 'Manus 2.0 launch video skill ready to paste into Claude Code or Cursor.',
      type: 'success',
    });

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D8F651', '#101010', '#FF4B26'],
      });
    } catch {}

    setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
  };

  const handleSimulateUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;

    setAnalyzing(true);
    setStoryboardResult(null);

    setTimeout(() => {
      let brand = 'Your Startup';
      try {
        const clean = inputUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        brand = clean.charAt(0).toUpperCase() + clean.slice(1);
      } catch {}

      setStoryboardResult({
        brandName: brand,
        hook: `Everything you thought about ${brand} was just the beginning.`,
        beats: [
          '00:00 - Heavy Sub-bass kick & Kinetic bold type drop',
          '00:18 - Panoramic mountain landscape plate with frosted acrylic card',
          '00:45 - High-speed UI push-in tracking real user workflows',
          '01:10 - "One More Thing" finale & chromatic logo mark pulse',
        ],
      });
      setAnalyzing(false);
      addToast({
        title: 'Storyboard Generated!',
        message: `Extracted narrative beats for ${brand}.`,
        type: 'success',
      });
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Breadcrumb matching Reference Screenshot 3 */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8A867D] mb-4">
          <Link href="/skills" className="hover:text-[#101010] transition-colors">Skills</Link>
          <span>/</span>
          <span className="text-[#101010]">AI videos</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          {/* Pill Badge matching Screenshot 3 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>AI LAUNCH VIDEO SKILL &bull; CLAUDE OPUS 5.5</span>
          </div>

          {/* Big Headline matching Screenshot 3 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#101010] tracking-tight leading-[1.08] mb-6">
            Make a Manus 2.0 style product launch video from your URL
          </h1>

          {/* Description matching Screenshot 3 */}
          <p className="text-sm sm:text-base text-[#8A867D] font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            Paste your product URL. The Skill researches your site, writes a storyboard from your own facts and renders a 75–120 second launch video: big kinetic type, real UI push-ins, frosted glass cards on landscape plates and a One More Thing reveal, all cut to the beat.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
            <button
              onClick={handleGetSkill}
              className={`pill-btn px-7 py-3.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${
                !isUserPro
                  ? 'bg-[#101010] text-[#D8F651] hover:bg-[#252525]'
                  : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
              }`}
            >
              {!isUserPro ? (
                <>
                  <Key className="w-4 h-4 text-[#D8F651]" />
                  <span>Get the Skill (Pro)</span>
                  <ArrowRight className="w-4 h-4 text-[#D8F651]" />
                </>
              ) : copiedCode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Skill Copied ✓</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>Get the Skill →</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('launch-examples');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="pill-btn px-6 py-3.5 rounded-full bg-white hover:bg-[#F7F4EE] text-[#101010] font-black text-xs sm:text-sm border border-[#E8E4DA] shadow-xs flex items-center gap-2"
            >
              <span>Watch examples</span>
            </button>
          </div>

          {/* Specification Pills matching Screenshot 3 */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#8A867D]">
            {['75–120 s films', '1080p · 2K · 4K', 'Claude Opus 5.5', 'Beat-synced soundtrack'].map((spec) => (
              <span
                key={spec}
                className="px-3.5 py-1.5 rounded-full bg-[#F7F4EE] border border-[#E8E4DA] text-[#101010] font-bold shadow-2xs"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Video Showcase Player Frame (matching Screenshot 3: "Secure and in control" hero plate) */}
        <div id="launch-examples" className="max-w-5xl mx-auto mb-16">
          <div className="relative rounded-3xl overflow-hidden bg-[#101010] border-2 border-[#101010] shadow-2xl group">
            {/* Background scenic plate with mountain & blue sky (matching reference) */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop"
                alt="Manus 2.0 Launch Video Preview"
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
              />

              {/* Frosted Glass Overlay Plate (matching Screenshot 3) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/85 backdrop-blur-xl border border-white/60 p-6 sm:p-10 rounded-3xl shadow-2xl max-w-xl mx-auto transform group-hover:scale-102 transition-all">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FF4B26] block mb-1">
                    01 // LAUNCH STORYBOARD
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight mb-3">
                    Secure and in control
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8A867D] font-medium leading-relaxed mb-6">
                    A cinematic kinetic film automatically generated from your landing page copy, architecture, and live app views.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-mono font-bold">
                      128 BPM // 4K 60FPS
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Play Trigger */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute bottom-6 right-6 z-20 px-4 py-2 rounded-full bg-black/80 hover:bg-black text-[#D8F651] backdrop-blur-md text-xs font-black flex items-center gap-2 border border-white/20 transition-transform active:scale-95 shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-[#D8F651]" /> : <Play className="w-4 h-4 fill-[#D8F651]" />}
                <span>{isPlaying ? 'Pause Preview' : 'Play Live Film'}</span>
              </button>

              {/* Status Indicator */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#D8F651] animate-pulse" />
                <span>Opus 5.5 Autonomous Render</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive URL Simulator: "Paste your product URL" */}
        <div className="max-w-4xl mx-auto mb-20 p-6 sm:p-10 rounded-3xl bg-[#FAF8F5] border border-[#E8E4DA] shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#8A867D]">
              TRY THE WORKFLOW
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#101010] mt-1">
              Enter any URL to plan a launch film
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mt-1 font-medium">
              The AI agent extracts value propositions and formats an executable timeline.
            </p>
          </div>

          <form onSubmit={handleSimulateUrl} className="max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="url"
                required
                placeholder="https://yourproduct.com"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 w-full px-5 py-3.5 rounded-full bg-white border border-[#E8E4DA] focus:border-[#101010] outline-none text-xs sm:text-sm font-semibold shadow-2xs"
              />
              <button
                type="submit"
                disabled={analyzing}
                className="w-full sm:w-auto pill-btn px-6 py-3.5 bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-black text-xs rounded-full shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[#D8F651] border-t-transparent animate-spin" />
                    <span>Researching URL...</span>
                  </span>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-[#D8F651]" />
                    <span>Generate Storyboard</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick preset links */}
            <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-[#8A867D]">
              <span>Or try:</span>
              {['https://linear.app', 'https://supabase.com', 'https://raycast.com'].map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setInputUrl(u)}
                  className="font-bold text-[#101010] hover:underline"
                >
                  {u.replace('https://', '')}
                </button>
              ))}
            </div>
          </form>

          {/* Storyboard Result Display */}
          {storyboardResult && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E4DA] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3 border-b border-[#F0EDE6] pb-3">
                <span className="text-xs font-black uppercase text-[#101010] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#D8F651]" />
                  <span>Storyboard Blueprint: {storyboardResult.brandName}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F4EE] border border-[#E8E4DA] font-bold">
                  Claude Opus 5.5
                </span>
              </div>
              <p className="text-xs font-extrabold text-[#101010] mb-3 italic">
                "{storyboardResult.hook}"
              </p>
              <div className="space-y-2 text-xs font-medium text-[#1A1A1A]">
                {storyboardResult.beats.map((beat, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-[#F7F4EE]/60 border border-[#E8E4DA]/40">
                    <span className="text-[10px] font-mono font-bold text-[#FF4B26] shrink-0 mt-0.5">
                      [{i + 1}]
                    </span>
                    <span>{beat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Complete Executable Skill Instruction Pack Codebox */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#101010]">
                Executable Skill Instructions (SKILL.md)
              </h3>
              <p className="text-xs text-[#8A867D] font-medium">
                Add directly to your Claude Code or Cursor project root.
              </p>
            </div>

            <button
              onClick={handleGetSkill}
              className={`pill-btn px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
                copiedCode
                  ? 'bg-[#101010] text-[#D8F651]'
                  : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
              }`}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Skill Pack'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-[#101010] border border-[#252525] p-5 text-left font-mono text-xs text-[#D8F651]/90 shadow-xl max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">{MANUS_SKILL_CODE}</pre>
          </div>
        </div>

        {/* Four Technical Breakdown Steps */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                num: '01',
                title: 'URL Research & Extraction',
                desc: 'Scrapes features, testimonials, screenshots, and visual branding directly from your site.',
              },
              {
                num: '02',
                title: 'Kinetic Typographic Arc',
                desc: 'Generates beat-synced kinetic type statements that punch through visual noise.',
              },
              {
                num: '03',
                title: 'Frosted Glass Shaders',
                desc: 'Places real UI components on translucent frosted plates with physics-based inertia.',
              },
              {
                num: '04',
                title: '"One More Thing" Climax',
                desc: 'Choreographs the final audio-visual reveal that drives high commercial conversions.',
              },
            ].map((step) => (
              <div key={step.num} className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                <span className="text-2xl font-black text-[#D8F651] bg-[#101010] px-2.5 py-0.5 rounded-lg inline-block mb-3">
                  {step.num}
                </span>
                <h4 className="text-sm font-black text-[#101010] mb-1.5">{step.title}</h4>
                <p className="text-xs text-[#8A867D] leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
