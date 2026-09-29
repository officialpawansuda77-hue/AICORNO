'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { CATEGORIES, AI_MODELS } from '@/data/categoriesModels';
import { PlusCircle, Sparkles, Video, Image as ImageIcon, Bot, ArrowRight, CheckCircle2, Upload, Loader2 } from 'lucide-react';

export default function SubmitPromptPage() {
  const router = useRouter();
  const { addSubmission, currentUser, setAuthModalOpen, addToast } = useAppStore();

  const [type, setType] = useState<'image' | 'video' | 'skill'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Automotive');
  const [model, setModel] = useState('Flux.1 Pro');
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [previewUrl, setPreviewUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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
          title: 'Uploaded to Cloudflare R2',
          message: `Asset stored in R2 bucket (${(data.size / 1024).toFixed(1)} KB)`,
          type: 'success',
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      addToast({
        title: 'Upload Failed',
        message: err?.message || 'Could not upload to Cloudflare R2',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    addSubmission({
      title,
      type,
      description,
      prompt,
      category,
      model,
      style,
      aspect_ratio: aspectRatio,
      preview_url:
        previewUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      tags: tags.length > 0 ? tags : ['community', 'ai'],
      submitted_by: currentUser.email,
    });

    setSubmittedSuccess(true);
  };

  if (submittedSuccess) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F3EE] text-[#0F5132] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#101010] mb-2">
            Prompt Submitted for Review!
          </h2>
          <p className="text-xs sm:text-sm text-[#8A867D] mb-8 leading-relaxed">
            Thank you for contributing to AICORN. Our curators test prompt consistency and camera directions before publishing to the gallery. You can track this in your dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setTitle('');
                setPrompt('');
                setDescription('');
              }}
              className="pill-btn px-5 py-2.5 bg-white text-[#101010] border border-[#E8E4DA] text-xs font-bold rounded-full"
            >
              Submit Another
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="pill-btn px-5 py-2.5 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full"
            >
              Go to Dashboard
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
            <span>CREATOR CONTRIBUTIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight">
            Submit a Prompt or Skill
          </h1>
          <p className="text-xs sm:text-sm text-[#8A867D] mt-2 font-medium">
            Share your best AI image prompts, video motion prompts, or agent skill instructions with the community.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-[#E8E4DA] p-6 sm:p-10 shadow-sm space-y-6">
          
          {/* Format Selector Pills */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#101010] mb-2.5">
              Select What You Are Submitting
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setType('image')}
                className={`py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                  type === 'image'
                    ? 'bg-[#101010] text-[#D8F651] border-[#101010]'
                    : 'bg-[#F7F4EE] text-[#1A1A1A] border-[#E8E4DA] hover:bg-[#ECE8DF]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => setType('video')}
                className={`py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                  type === 'video'
                    ? 'bg-[#101010] text-[#D8F651] border-[#101010]'
                    : 'bg-[#F7F4EE] text-[#1A1A1A] border-[#E8E4DA] hover:bg-[#ECE8DF]'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => setType('skill')}
                className={`py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                  type === 'skill'
                    ? 'bg-[#101010] text-[#D8F651] border-[#101010]'
                    : 'bg-[#F7F4EE] text-[#1A1A1A] border-[#E8E4DA] hover:bg-[#ECE8DF]'
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
              placeholder="e.g. 'Luxury Skincare Serum Macro Campaign' or 'YouTube Research Agent'"
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
              placeholder="Brief summary of the visual result or agent workflow..."
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
                  : 'Specify subject, camera lens, lighting conditions, and composition...'
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
                {CATEGORIES.map((c) => (
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
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Style & Aspect Ratio (if prompt) */}
          {type !== 'skill' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          )}

          {/* Preview Media URL & Supabase Storage Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#101010]">
                Preview Media URL
              </label>
              <label className="text-[11px] font-black text-[#101010] bg-[#D8F651] hover:bg-[#C5E53E] px-2.5 py-0.5 rounded-full cursor-pointer transition-colors flex items-center gap-1 shadow-2xs">
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[#101010]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 text-[#101010]" />
                    <span>Upload to Supabase Storage</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
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
              placeholder="https://njzxalelggtlxaoxxjkk.supabase.co/storage/v1/object/public/... or paste URL"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs text-[#101010] focus:outline-none focus:border-[#101010]"
            />
            {isUploading && (
              <p className="text-[11px] text-[#8A867D] mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-[#101010]" /> Storing media in Supabase user-submissions bucket...
              </p>
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

          {/* Submit CTA */}
          <div className="pt-4 border-t border-[#F0EDE6]">
            <button
              type="submit"
              className="pill-btn w-full py-4 rounded-full bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-black text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <span>Submit for Curator Review</span>
              <ArrowRight className="w-4 h-4 text-[#D8F651]" />
            </button>
          </div>

        </form>

      </div>
    </AppLayout>
  );
}
