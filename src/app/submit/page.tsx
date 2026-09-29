'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { CATEGORIES, AI_MODELS } from '@/data/categoriesModels';
import { parseMediaUrl } from '@/lib/mediaUtils';
import {
  PlusCircle,
  Sparkles,
  Video,
  Image as ImageIcon,
  Bot,
  ArrowRight,
  CheckCircle2,
  Upload,
  Loader2,
  ExternalLink,
  Play,
  Film
} from 'lucide-react';

export default function SubmitPromptPage() {
  const router = useRouter();
  const { addPrompt, addSkill, addSubmission, currentUser, setAuthModalOpen, addToast } = useAppStore();

  const [type, setType] = useState<'image' | 'video' | 'skill'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Automotive');
  const [model, setModel] = useState('ChatGPT');
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('8s');
  const [videoLink, setVideoLink] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPromptId, setSubmittedPromptId] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Handle Google Drive / Video URL input change
  const handleVideoLinkChange = (raw: string) => {
    setVideoLink(raw);
    const parsed = parseMediaUrl(raw);
    if (parsed.isGoogleDrive && parsed.thumbnailUrl && !previewUrl) {
      setPreviewUrl(parsed.thumbnailUrl);
    }
  };

  const parsedVideo = parseMediaUrl(videoLink);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'submission');
      formData.append('category', category);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setPreviewUrl(data.url);
        addToast({
          title: 'Uploaded Successfully',
          message: `Asset saved to Supabase Storage (${(data.size / 1024).toFixed(1)} KB)`,
          type: 'success',
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      addToast({
        title: 'Upload Failed',
        message: err?.message || 'Could not upload to Supabase Storage',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      // Determine video and preview assets
      const resolvedVideoUrl = parsedVideo.embedUrl || videoLink.trim() || undefined;
      let resolvedPreviewUrl = previewUrl.trim();

      if (!resolvedPreviewUrl) {
        if (parsedVideo.isGoogleDrive && parsedVideo.thumbnailUrl) {
          resolvedPreviewUrl = parsedVideo.thumbnailUrl;
        } else if (parsedVideo.isYouTube && parsedVideo.thumbnailUrl) {
          resolvedPreviewUrl = parsedVideo.thumbnailUrl;
        } else if (type === 'video') {
          resolvedPreviewUrl = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop';
        } else {
          resolvedPreviewUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
        }
      }

      // 1. Immediately create and publish into live app prompts or skills
      if (type === 'skill') {
        addSkill({
          title,
          category: category as any,
          output_type: (style || 'Workflow') as any,
          description: description || 'Autonomous AI Agent Skill',
          compatible_agents: [model],
          preview_image: resolvedPreviewUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
          install_prompt: prompt,
          capabilities: [description || 'Agent execution pack'],
          instructions: [prompt],
          tags: tags.length > 0 ? tags : ['skill', 'ai', category.toLowerCase()],
          rating: 5.0,
          is_pro: false,
          is_featured: false,
        });
        setSubmittedSuccess(true);
        return;
      }

      const createdPrompt = await addPrompt({
        title,
        type: type as 'image' | 'video',
        description,
        prompt,
        category,
        subcategory: 'Community',
        model,
        style,
        aspect_ratio: (aspectRatio as any) || '16:9',
        duration: type === 'video' ? duration : undefined,
        preview_url: resolvedPreviewUrl,
        video_url: type === 'video' ? resolvedVideoUrl : undefined,
        tags: tags.length > 0 ? tags : ['community', 'ai'],
        author: {
          name: currentUser.name || 'Creator',
          handle: currentUser.handle || '@creator',
          avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        },
        rating: 5.0,
        is_pro: false,
        is_featured: false,
        is_trending: true,
      });

      // 2. Also register in submissions tracking
      try {
        await addSubmission({
          title,
          type,
          description,
          prompt,
          category,
          model,
          style,
          aspect_ratio: aspectRatio,
          preview_url: resolvedPreviewUrl,
          tags: tags.length > 0 ? tags : ['community', 'ai'],
          submitted_by: currentUser.email,
        });
      } catch {
        // Safe fallback
      }

      setSubmittedPromptId(createdPrompt.id);
      setSubmittedSuccess(true);
    } catch (err: any) {
      addToast({
        title: 'Submission Failed',
        message: err?.message || 'Could not publish prompt. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-18 h-18 rounded-3xl bg-[#D8F651] text-[#101010] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-[#101010] tracking-tight mb-3">
            Prompt Published &amp; Live!
          </h2>
          <p className="text-sm text-[#8A867D] mb-8 leading-relaxed">
            Your prompt has been published to AICORN. It is now instantly visible in the public gallery, on category pages, and in search.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {submittedPromptId && (
              <Link
                href={`/prompts/${submittedPromptId}`}
                className="pill-btn px-6 py-3 bg-[#101010] text-[#D8F651] text-xs font-black rounded-full flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
              >
                <span>View Your Prompt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href={type === 'video' ? '/prompts/video' : '/prompts/image'}
              className="pill-btn px-6 py-3 bg-white text-[#101010] border border-[#E8E4DA] text-xs font-bold rounded-full hover:bg-[#F7F4EE] transition-colors"
            >
              Browse {type === 'video' ? 'Video' : 'Image'} Gallery
            </Link>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setTitle('');
                setPrompt('');
                setDescription('');
                setVideoLink('');
                setPreviewUrl('');
                setTagInput('');
                setSubmittedPromptId(null);
              }}
              className="pill-btn px-5 py-3 text-xs font-bold text-[#8A867D] hover:text-[#101010] transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-3">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Community Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight">
            Submit a Prompt
          </h1>
          <p className="text-sm text-[#8A867D] mt-2 max-w-lg mx-auto">
            Share your best AI image or video prompts with creators. Your submissions go live instantly in the gallery.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-10 space-y-6 shadow-sm">
          
          {/* Submission Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-[#101010] mb-2 uppercase tracking-wider">
              Asset Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('image');
                  if (!AI_MODELS.filter((m) => m.type !== 'video').some((m) => m.name === model)) {
                    setModel('ChatGPT');
                  }
                }}
                className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
                  type === 'image'
                    ? 'bg-[#101010] text-[#D8F651] border-[#101010] shadow-sm'
                    : 'bg-[#F7F4EE] text-[#8A867D] border-[#E8E4DA] hover:border-black/20'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('video');
                  if (!AI_MODELS.filter((m) => m.type === 'video').some((m) => m.name === model)) {
                    setModel('Kling 1.5');
                  }
                }}
                className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
                  type === 'video'
                    ? 'bg-[#101010] text-[#D8F651] border-[#101010] shadow-sm'
                    : 'bg-[#F7F4EE] text-[#8A867D] border-[#E8E4DA] hover:border-black/20'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('skill');
                  setModel('Claude 3.5 Sonnet');
                }}
                className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
                  type === 'skill'
                    ? 'bg-[#101010] text-[#D8F651] border-[#101010] shadow-sm'
                    : 'bg-[#F7F4EE] text-[#8A867D] border-[#E8E4DA] hover:border-black/20'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Agent Skill</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#101010] mb-1.5">
              Title <span className="text-[#FF4B26]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 'Porsche 911 GT3 in Neon Rain' or 'Ghibli Style Train Station'"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#101010] mb-1.5">
              Short Description / Value Proposition
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the visual result or cinematic mood..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
            />
          </div>

          {/* Prompt / Instructions Box */}
          <div>
            <label className="block text-xs font-bold text-[#101010] mb-1.5">
              {type === 'skill' ? 'Complete Skill Instruction Pack (Markdown)' : 'Full Prompt Parameters'} <span className="text-[#FF4B26]">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                type === 'skill'
                  ? '--- name: my-skill ...\n\nYou are an autonomous agent specialized in...'
                  : 'Specify subject, lighting, camera lens, atmospheric haze, and color grade...'
              }
              className="w-full p-4 rounded-2xl bg-[#101010] font-mono text-xs text-[#D8F651] focus:outline-none focus:ring-1 focus:ring-[#D8F651] leading-relaxed"
            />
          </div>

          {/* Category & Model Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#101010] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold text-[#101010] focus:outline-none"
              >
                {type === 'skill'
                  ? ['Developer', 'Workflow Automation', 'Productivity', 'Writing & SEO', 'Research & Intelligence', 'Design & UI/UX'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  : CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101010] mb-1.5">Model Target</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold text-[#101010] focus:outline-none"
              >
                {type === 'video'
                  ? AI_MODELS.filter((m) => m.type === 'video').map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))
                  : type === 'skill'
                    ? ['Claude 3.5 Sonnet', 'GPT-4o', 'DeepSeek R1', 'Gemini 2.0 Flash'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))
                    : AI_MODELS.filter((m) => m.type !== 'video').map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
              </select>
            </div>
          </div>

          {/* Style & Aspect Ratio (if prompt) */}
          {type !== 'skill' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101010] mb-1.5">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold text-[#101010] focus:outline-none"
                >
                  {['Cinematic', 'Photorealistic', 'Editorial', 'Minimal', 'Luxury', '3D', 'Anime', 'Commercial', 'UGC'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101010] mb-1.5">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold text-[#101010] focus:outline-none"
                >
                  {['16:9', '9:16', '1:1', '4:5', '3:4'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {type === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1.5">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold text-[#101010] focus:outline-none"
                  >
                    {['5s', '6s', '8s', '10s', '15s', '30s'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* VIDEO LINK SECTION (Google Drive / YouTube / Direct MP4) */}
          {type === 'video' && (
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010] flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-[#101010]" />
                  <span>Google Drive Video Link (No Storage Limits)</span>
                </label>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D8F651] text-[#101010]">
                  Recommended
                </span>
              </div>
              
              <input
                type="url"
                value={videoLink}
                onChange={(e) => handleVideoLinkChange(e.target.value)}
                placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DA] text-xs text-[#101010] focus:outline-none focus:border-[#101010]"
              />

              <p className="text-[11px] text-[#8A867D] leading-relaxed">
                <span className="font-bold text-[#101010]">How to use Google Drive:</span> Upload your video file to Google Drive, right click &rarr; <span className="font-semibold text-[#101010]">Share</span> &rarr; change General access to <span className="font-semibold text-[#101010]">&quot;Anyone with the link can view&quot;</span>, and paste the URL here. The video will stream directly in the app.
              </p>

              {/* Live Video Player Preview */}
              {parsedVideo.embedUrl && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-[#101010] mb-1.5 flex items-center gap-1">
                    <Play className="w-3 h-3 text-[#101010]" /> Live Video Preview:
                  </p>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#E8E4DA] shadow-md">
                    {parsedVideo.isDirectVideo ? (
                      <video
                        src={parsedVideo.directStreamUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={parsedVideo.embedUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title="Video Preview"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGE UPLOAD & PREVIEW SECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#101010]">
                {type === 'video' ? 'Cover / Poster Thumbnail URL (Optional)' : 'Image Preview URL'}
              </label>

              {/* Supabase Storage Upload Button for Images */}
              <label className="text-[11px] font-black text-[#101010] bg-[#D8F651] hover:bg-[#C5E53E] px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1 shadow-2xs">
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[#101010]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 text-[#101010]" />
                    <span>Upload Image File</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or paste image URL"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs text-[#101010] focus:outline-none focus:border-[#101010]"
            />

            {previewUrl && (
              <div className="mt-3 flex items-center gap-3 p-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA]">
                <img
                  src={previewUrl}
                  alt="Asset Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-[#E8E4DA] shrink-0"
                />
                <div className="text-xs text-[#8A867D] truncate">
                  <p className="font-bold text-[#101010]">Thumbnail Active</p>
                  <p className="truncate text-[11px]">{previewUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#101010] mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. supercar, night, rain, neon, commercial"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs text-[#101010] focus:outline-none focus:border-[#101010]"
            />
          </div>

          {/* Terms & Copyright Consent */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="consent-check"
              required
              className="mt-1 w-4 h-4 rounded border-[#E8E4DA] text-[#101010] focus:ring-[#D8F651] cursor-pointer"
            />
            <label htmlFor="consent-check" className="text-xs text-[#8A867D] leading-relaxed cursor-pointer select-none">
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="underline text-[#101010] font-bold">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="underline text-[#101010] font-bold">
                Privacy Policy
              </Link>
              , and confirm that I own or have legal rights to share this prompt and media without infringing third-party copyright.
            </label>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-[#F0EDE6]">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="pill-btn w-full py-4 rounded-full bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D8F651]" />
                  <span>Publishing Prompt...</span>
                </>
              ) : (
                <>
                  <span>Publish Prompt to Gallery</span>
                  <ArrowRight className="w-4 h-4 text-[#D8F651]" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </AppLayout>
  );
}
