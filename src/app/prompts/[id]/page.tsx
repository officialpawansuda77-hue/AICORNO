'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PromptCard from '@/components/cards/PromptCard';
import { useAppStore } from '@/lib/store';
import { canCopyPrompt } from '@/lib/membership';
import { fetchPromptByIdFromDb } from '@/lib/supabaseService';
import { Prompt } from '@/types';
import { isCategoryMatch, normalizeCategoryName } from '@/lib/categories';
import { parseMediaUrl, isDirectVideoUrl } from '@/lib/mediaUtils';
import {
  ArrowLeft,
  Copy,
  Check,
  Heart,
  Share2,
  Download,
  Play,
  Pause,
  Sparkles,
  Video as VideoIcon,
  Image as ImageIcon,
  Camera,
  Sun,
  Eye,
  Layers,
  Clock,
  Maximize2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    prompts,
    getPromptById,
    toggleFavorite,
    isFavorite,
    incrementCopies,
    recordView,
    addToast,
    openUpgradeModal,
    currentUser,
  } = useAppStore();

  const [prompt, setPrompt] = useState<Prompt | undefined>(() => getPromptById(id));
  const [isLoading, setIsLoading] = useState(!prompt);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const viewRecordedRef = useRef(false);

  // Sync prompt from store or database once
  useEffect(() => {
    let isMounted = true;
    const found = getPromptById(id);
    if (found) {
      setPrompt(found);
      setIsLoading(false);
      return;
    }

    async function loadPrompt() {
      setIsLoading(true);
      const dbPrompt = await fetchPromptByIdFromDb(id);
      if (isMounted) {
        setPrompt(dbPrompt);
        setIsLoading(false);
      }
    }
    loadPrompt();
    return () => {
      isMounted = false;
    };
  }, [id, getPromptById]);

  // Record view on mount (strictly once per prompt id)
  useEffect(() => {
    if (prompt?.id && !viewRecordedRef.current) {
      viewRecordedRef.current = true;
      recordView(prompt.id);
    }
  }, [prompt?.id, recordView]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#101010] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#101010]">Loading prompt details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!prompt) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-[#101010] mb-2">Prompt Not Found</h2>
          <p className="text-sm text-[#8A867D] mb-6">The prompt you are looking for does not exist in the gallery.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8E4DA] text-[#101010] text-xs font-bold rounded-full"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              href="/prompts/image"
              className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Prompts</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const favorited = isFavorite(prompt.id);
  const mediaList = prompt.thumbnails && prompt.thumbnails.length > 0
    ? [prompt.preview_url, ...prompt.thumbnails.filter(t => t !== prompt.preview_url)]
    : [prompt.preview_url];

  const handleCopy = () => {
    if (!prompt) return;

    if (!canCopyPrompt(prompt, currentUser)) {
      openUpgradeModal({
        reason: 'pro_prompt',
        itemTitle: prompt.title,
      });
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt.prompt);
    }
    setCopied(true);
    incrementCopies(prompt.id);
    setPrompt((prev) => (prev ? { ...prev, copies: (prev.copies || 0) + 1 } : prev));
    addToast({
      title: 'Prompt copied to clipboard!',
      message: 'Recorded copy event in Supabase.',
      type: 'success',
    });

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D8F651', '#101010', '#FF4B26'],
      });
    } catch (e) {
      // safe fallback
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const storePrompt = prompts.find((p) => p.id === prompt?.id);
  const liveCopies = storePrompt?.copies ?? prompt?.copies ?? 0;

  const handleDownload = () => {
    const data = JSON.stringify(prompt, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.id}-${prompt.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Prompt Downloaded', message: 'Saved metadata file to disk.', type: 'info' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({ title: 'Link Copied!', message: 'Shareable prompt URL copied to clipboard.', type: 'success' });
    }
  };

  const similarPrompts = prompts
    .filter((p) => p.id !== prompt.id && isCategoryMatch(p.category, prompt.category))
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* TOP: Breadcrumb & Back Link */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E4DA] text-xs font-semibold text-[#8A867D]">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#101010] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href={prompt.type === 'video' ? '/prompts/video' : '/prompts/image'}
              className="hover:text-[#101010] transition-colors"
            >
              {prompt.type === 'video' ? 'Video Prompts' : 'Image Prompts'}
            </Link>
            <span>/</span>
            <span className="text-[#8A867D]">{normalizeCategoryName(prompt.category)}</span>
            <span>/</span>
            <span className="text-[#101010] font-bold truncate max-w-[200px]">
              {prompt.title}
            </span>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#101010] hover:underline font-bold shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to prompts</span>
          </button>
        </div>

        {/* MAIN CONTENT: Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Media Gallery & How-To-Use */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Main Media Preview Frame */}
            {(() => {
              const isVertical = prompt.aspect_ratio === '9:16';
              const mediaAspectClass =
                prompt.aspect_ratio === '9:16'
                  ? 'aspect-[9/16]'
                  : prompt.aspect_ratio === '1:1'
                  ? 'aspect-square'
                  : prompt.aspect_ratio === '4:5'
                  ? 'aspect-[4/5]'
                  : prompt.aspect_ratio === '3:4'
                  ? 'aspect-[3/4]'
                  : 'aspect-[16/9]';

              return (
                <div className={`relative rounded-[28px] overflow-hidden bg-black border border-[#E8E4DA] shadow-lg group ${isVertical ? 'max-w-[440px] mx-auto' : 'w-full'}`}>
                  {prompt.type === 'video' ? (
                    (() => {
                      const videoSrc = prompt.video_url || (isDirectVideoUrl(prompt.preview_url) ? prompt.preview_url : undefined);
                      const parsedVideo = parseMediaUrl(videoSrc || prompt.video_url || prompt.preview_url);
                      const hasVideoSource = Boolean(parsedVideo.embedUrl || parsedVideo.isDirectVideo || videoSrc);
                      const isDirect = Boolean(parsedVideo.isDirectVideo || (videoSrc && isDirectVideoUrl(videoSrc)));
                      const hasImageThumb = !isDirectVideoUrl(prompt.preview_url) && Boolean(prompt.preview_url || parsedVideo.thumbnailUrl);

                      if (isPlaying && hasVideoSource) {
                        if (parsedVideo.isGoogleDrive || parsedVideo.isYouTube) {
                          return (
                            <div className={`relative ${mediaAspectClass} w-full bg-black`}>
                              <iframe
                                src={parsedVideo.embedUrl}
                                className="w-full h-full border-0"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                title={prompt.title}
                              />
                              <button
                                onClick={() => setIsPlaying(false)}
                                className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-[#D8F651] text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20 shadow-md"
                              >
                                <Pause className="w-3.5 h-3.5 fill-[#D8F651]" />
                                <span>Stop Video</span>
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className={`relative ${mediaAspectClass} w-full bg-black`}>
                            <video
                              src={parsedVideo.directStreamUrl || videoSrc || prompt.video_url || prompt.preview_url}
                              poster={hasImageThumb ? (mediaList[activeMediaIndex] || prompt.preview_url) : undefined}
                              controls
                              autoPlay
                              playsInline
                              className="w-full h-full object-contain"
                            />
                            <button
                              onClick={() => setIsPlaying(false)}
                              className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-[#D8F651] text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20 shadow-md"
                            >
                              <Pause className="w-3.5 h-3.5 fill-[#D8F651]" />
                              <span>Close Video</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className={`relative ${mediaAspectClass} w-full bg-black flex items-center justify-center`}>
                          {isDirect && !hasImageThumb ? (
                            <video
                              src={videoSrc || prompt.preview_url}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img
                              src={mediaList[activeMediaIndex] || (parsedVideo.googleDriveId ? `https://lh3.googleusercontent.com/d/${parsedVideo.googleDriveId}=w1000` : parsedVideo.thumbnailUrl) || prompt.preview_url}
                              alt={prompt.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (parsedVideo.isGoogleDrive && parsedVideo.embedUrl) {
                                  img.style.display = 'none';
                                  const parent = img.parentElement;
                                  if (parent && !parent.querySelector('iframe')) {
                                    const iframe = document.createElement('iframe');
                                    iframe.src = `${parsedVideo.embedUrl}?autoplay=0`;
                                    iframe.className = 'w-full h-full border-0 pointer-events-none';
                                    iframe.tabIndex = -1;
                                    parent.appendChild(iframe);
                                  }
                                } else {
                                  img.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
                                }
                              }}
                            />
                          )}

                          {/* Google Drive Video Badge */}
                          {parsedVideo.isGoogleDrive && (
                            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/80 text-[#D8F651] text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-[#D8F651]/40">
                              <Play className="w-3 h-3 fill-[#D8F651]" />
                              <span>Google Drive Video</span>
                            </div>
                          )}

                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <button
                              onClick={() => setIsPlaying(true)}
                              className="w-16 h-16 rounded-full bg-[#101010]/85 hover:bg-[#101010] text-[#D8F651] flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 shadow-2xl border border-white/20"
                              aria-label="Play Video"
                            >
                              <Play className="w-7 h-7 fill-[#D8F651] ml-1" />
                            </button>
                          </div>

                          {/* Video Specs Tag */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-black/80 text-[#D8F651] text-xs font-mono font-bold backdrop-blur-md">
                              {prompt.duration || '8s'} &bull; {prompt.aspect_ratio}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/80 text-white text-xs font-bold backdrop-blur-md">
                              {prompt.model}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className={`relative ${mediaAspectClass} w-full bg-[#EDEDEA] flex items-center justify-center`}>
                      <img
                        src={mediaList[activeMediaIndex]}
                        alt={prompt.title}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                        {prompt.aspect_ratio} &bull; {prompt.style}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {mediaList.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeMediaIndex === idx
                        ? 'border-[#101010] scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* HOW TO USE THIS PROMPT SECTION */}
            <div className="bg-white rounded-[28px] border border-[#E8E4DA] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#101010]" />
                <h3 className="text-xl font-black text-[#101010]">
                  How to Use This Prompt
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: 'Step 1', title: `Launch your AI model (${prompt.model})`, desc: `Open ${prompt.model} or your preferred generative studio interface.` },
                  { step: 'Step 2', title: 'Copy the prompt parameters', desc: 'Click "Copy Prompt" to copy the exact camera, lighting, and textural directions to your clipboard.' },
                  { step: 'Step 3', title: 'Adjust bracketed variables if necessary', desc: 'Swap colors, subject materials, or aspect ratio parameters to fit your custom brand guidelines.' },
                  { step: 'Step 4', title: 'Generate your initial batch', desc: 'Run 4 variations to evaluate optical coherence and composition balance.' },
                  { step: 'Step 5', title: 'Iterate using prompt camera controls', desc: 'Tweak camera distance or Kelvin lighting values for precise commercial finishing.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA]">
                    <div className="w-8 h-8 rounded-full bg-[#101010] text-[#D8F651] font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#101010]">{item.title}</h4>
                      <p className="text-xs text-[#8A867D] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Prompt Information Card */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Header info */}
            <div className="bg-white rounded-[28px] border border-[#E8E4DA] p-6 sm:p-7 shadow-sm">
              
              {/* Badges row */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider">
                    {prompt.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#F7F4EE] text-[#101010] text-xs font-bold border border-[#E8E4DA]">
                    {prompt.model}
                  </span>
                  {prompt.is_pro ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#FF4B26] text-white text-xs font-bold">
                      PRO
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-[#E8F3EE] text-[#101010] text-xs font-bold">
                      FREE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(prompt.id)}
                    aria-label="Save to favorites"
                    className="p-2 rounded-full hover:bg-[#F7F4EE] text-[#1A1A1A] transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${favorited ? 'text-[#FF4B26] fill-[#FF4B26]' : ''}`} />
                  </button>
                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    aria-label="Share prompt"
                    className="p-2 rounded-full hover:bg-[#F7F4EE] text-[#1A1A1A] transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title & Creator */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#101010] leading-tight mb-2">
                {prompt.title}
              </h1>

              <div className="flex items-center gap-3 py-3 border-y border-[#F0EDE6] my-4">
                <img
                  src={prompt.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                  alt={prompt.author?.name || 'Creator'}
                  className="w-10 h-10 rounded-full object-cover border border-[#E8E4DA]"
                />
                <div>
                  <div className="text-xs font-bold text-[#101010]">{prompt.author?.name || 'Creator'}</div>
                  <div className="text-[11px] text-[#8A867D]">{prompt.author?.handle || '@creator'}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs font-black text-[#101010]">{liveCopies.toLocaleString()} copies</div>
                  <div className="text-[11px] text-[#8A867D]">{prompt.views.toLocaleString()} views</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#8A867D] leading-relaxed mb-6 font-medium">
                {prompt.description}
              </p>

              {/* PROMPT BOX: Large Dark Container */}
              <div className="rounded-2xl bg-[#101010] p-5 text-white mb-5 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono text-[#8A867D] pb-3 mb-3 border-b border-white/10">
                  <span className="uppercase tracking-wider font-bold text-[#D8F651]">GENERATION PROMPT</span>
                  <span>{prompt.model}</span>
                </div>
                
                <p className="text-sm font-mono text-white/95 leading-relaxed selection:bg-[#D8F651] selection:text-[#101010]">
                  {prompt.prompt}
                </p>

                {/* Copy Action Button */}
                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`pill-btn flex-1 py-3 text-xs font-black rounded-full flex items-center justify-center gap-2 transition-all shadow-md ${
                      copied
                        ? 'bg-white text-[#101010]'
                        : 'bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Prompt copied ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    aria-label="Download prompt"
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* METADATA SPECS CARD */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8A867D] mb-3">
                  {prompt.type === 'video' ? 'Camera & Motion Specifications' : 'Optical & Studio Specifications'}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {prompt.type === 'video' ? (
                    <>
                      <div className="p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Duration</span>
                        <span className="font-bold text-[#101010]">{prompt.duration || '8 seconds'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Aspect Ratio</span>
                        <span className="font-bold text-[#101010]">{prompt.aspect_ratio}</span>
                      </div>
                      <div className="col-span-2 p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Camera Movement</span>
                        <span className="font-bold text-[#101010]">{prompt.camera || 'Slow cinematic tracking dolly'}</span>
                      </div>
                      <div className="col-span-2 p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Lighting & Optics</span>
                        <span className="font-bold text-[#101010]">{prompt.lighting || 'Golden hour warm specular'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Aspect Ratio</span>
                        <span className="font-bold text-[#101010]">{prompt.aspect_ratio}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Lens Spec</span>
                        <span className="font-bold text-[#101010]">{prompt.lens || '85mm f/1.4 Prime'}</span>
                      </div>
                      <div className="col-span-2 p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Camera Angle</span>
                        <span className="font-bold text-[#101010]">{prompt.camera || 'Eye-level studio macro'}</span>
                      </div>
                      <div className="col-span-2 p-2.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA]">
                        <span className="text-[10px] text-[#8A867D] block font-bold uppercase">Lighting Setup</span>
                        <span className="font-bold text-[#101010]">{prompt.lighting || 'Diffused daylight with caustics'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-5 pt-4 border-t border-[#F0EDE6] flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold text-[#8A867D] bg-[#F7F4EE] px-2.5 py-1 rounded-full border border-[#E8E4DA]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* SIMILAR PROMPTS */}
        {similarPrompts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E4DA]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-[#101010]">
                  Similar Prompts
                </h3>
                <p className="text-xs text-[#8A867D] mt-0.5">
                  More visual inspiration in {normalizeCategoryName(prompt.category)}
                </p>
              </div>
              <Link
                href={prompt.type === 'video' ? '/prompts/video' : '/prompts/image'}
                className="text-xs font-bold text-[#101010] hover:underline"
              >
                Browse All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarPrompts.map((simPrompt) => (
                <PromptCard key={simPrompt.id} prompt={simPrompt} />
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
