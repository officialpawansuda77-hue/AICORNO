'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { isUserAdmin, ADMIN_EMAIL } from '@/lib/authUtils';
import { supabase } from '@/lib/supabase';
import {
  fetchPromptsFromDb,
  fetchCategoriesFromDb,
  fetchModelsFromDb,
  fetchSubmissionsFromDb,
  updateSubmissionStatusInDb,
  adminCreatePromptInDb,
  adminUpdatePromptInDb,
  adminDeletePromptInDb
} from '@/lib/supabaseService';
import {
  Shield,
  LayoutDashboard,
  Sparkles,
  Video,
  Image as ImageIcon,
  Bot,
  Layers,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Plus,
  TrendingUp,
  Star,
  Eye,
  Copy,
  Settings,
  X,
  RotateCcw,
  Check,
  FolderPlus,
  Loader2,
  Upload
} from 'lucide-react';
import { Prompt, Category, AIModel } from '@/types';
import { parseMediaUrl } from '@/lib/mediaUtils';
import { AI_MODELS } from '@/data/categoriesModels';

export default function AdminPanelPage() {
  const {
    prompts: storePrompts,
    skills,
    submissions: storeSubmissions,
    updateSubmissionStatus,
    addPrompt,
    updatePrompt,
    deletePrompt,
    deleteSkill,
    currentUser,
    isLoadingAuth,
    setAuthModalOpen,
    addToast
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'prompts' | 'skills' | 'submissions' | 'categories' | 'models' | 'analytics' | 'settings'>('dashboard');
  
  // Prompt edit/create modal state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', formType);
      formData.append('category', formCategory);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setFormPreview(data.url);
        addToast({
          title: 'Asset Uploaded to Supabase Storage',
          message: `Stored in bucket "${data.bucket}" (${(data.size / 1024).toFixed(1)} KB)`,
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
      setIsUploadingMedia(false);
    }
  };

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatCover, setNewCatCover] = useState('');

  // Model modal state
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDesc, setNewModelDesc] = useState('');

  // Form states for Prompts
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'image' | 'video'>('image');
  const [formPrompt, setFormPrompt] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Automotive');
  const [formModel, setFormModel] = useState('Flux.1 Pro');
  const [formStyle, setFormStyle] = useState('Cinematic');
  const [formRatio, setFormRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5' | '3:4'>('16:9');
  const [formPreview, setFormPreview] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [formIsPro, setFormIsPro] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);

  // Live state from Supabase
  const [dbPrompts, setDbPrompts] = useState<Prompt[]>(storePrompts);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbModels, setDbModels] = useState<AIModel[]>([]);
  const [dbSubmissions, setDbSubmissions] = useState(storeSubmissions);

  // Load from Supabase on mount
  const refreshAdminData = async () => {
    try {
      const [promptsRes, cats, mods, subs] = await Promise.all([
        fetchPromptsFromDb({ limit: 100 }),
        fetchCategoriesFromDb(),
        fetchModelsFromDb(),
        fetchSubmissionsFromDb(),
      ]);

      if (promptsRes.prompts.length > 0) setDbPrompts(promptsRes.prompts);
      if (cats.length > 0) setDbCategories(cats);
      if (mods.length > 0) setDbModels(mods);
      if (subs.length > 0) setDbSubmissions(subs);
    } catch (e) {
      console.warn('Admin refresh fallback:', e);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  // Metrics
  const totalImagePrompts = dbPrompts.filter((p) => p.type === 'image').length;
  const totalVideoPrompts = dbPrompts.filter((p) => p.type === 'video').length;
  const totalCopies = dbPrompts.reduce((acc, p) => acc + (p.copies || 0), 0);
  const totalViews = dbPrompts.reduce((acc, p) => acc + (p.views || 0), 0);
  const pendingSubmissions = dbSubmissions.filter((s) => s.status === 'pending');

  const openCreateModal = () => {
    setEditingPrompt(null);
    setFormTitle('');
    setFormType('image');
    setFormPrompt('');
    setFormDesc('');
    setFormCategory('Automotive');
    setFormModel('ChatGPT');
    setFormStyle('Cinematic');
    setFormRatio('16:9');
    setFormPreview('');
    setFormVideoUrl('');
    setFormStatus('published');
    setFormIsPro(false);
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setIsPromptModalOpen(true);
  };

  const openEditModal = (p: Prompt) => {
    setEditingPrompt(p);
    setFormTitle(p.title);
    setFormType(p.type);
    setFormPrompt(p.prompt);
    setFormDesc(p.description);
    setFormCategory(p.category);
    setFormModel(p.model);
    setFormStyle(p.style);
    setFormRatio(p.aspect_ratio);
    setFormPreview(p.preview_url);
    setFormVideoUrl(p.video_url || '');
    setFormStatus('published');
    setFormIsPro(p.is_pro);
    setFormIsFeatured(p.is_featured);
    setFormIsTrending(p.is_trending);
    setIsPromptModalOpen(true);
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedVid = formType === 'video' ? parseMediaUrl(formVideoUrl) : null;
    const resolvedVideoUrl = formType === 'video' ? (parsedVid?.embedUrl || formVideoUrl || undefined) : undefined;
    const resolvedPreview = formPreview || (parsedVid?.thumbnailUrl || undefined);

    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, {
        title: formTitle,
        type: formType,
        prompt: formPrompt,
        description: formDesc,
        category: formCategory,
        model: formModel,
        style: formStyle,
        aspect_ratio: formRatio,
        preview_url: resolvedPreview || editingPrompt.preview_url,
        video_url: resolvedVideoUrl,
        is_pro: formIsPro,
        is_featured: formIsFeatured,
        is_trending: formIsTrending,
      });
    } else {
      await addPrompt({
        title: formTitle,
        type: formType,
        prompt: formPrompt,
        description: formDesc,
        category: formCategory,
        subcategory: 'General',
        model: formModel,
        style: formStyle,
        aspect_ratio: formRatio,
        preview_url: resolvedPreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        video_url: resolvedVideoUrl,
        tags: ['curated', formCategory.toLowerCase()],
        author: {
          name: currentUser?.name || 'AICORN Staff',
          handle: currentUser?.handle || '@aicorn_curator',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        },
        rating: 5.0,
        is_pro: formIsPro,
        is_featured: formIsFeatured,
        is_trending: formIsTrending,
      });
    }
    setIsPromptModalOpen(false);
    refreshAdminData();
  };

  const handleDeletePrompt = async (id: string) => {
    await deletePrompt(id);
    setDbPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleApproveSubmission = async (id: string) => {
    await updateSubmissionStatus(id, 'approved');
    setDbSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
    );
    refreshAdminData();
  };

  const handleRejectSubmission = async (id: string) => {
    await updateSubmissionStatus(id, 'rejected');
    setDbSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s))
    );
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      await supabase.from('categories').insert({
        name: newCatName,
        slug,
        description: newCatDesc,
        cover_image: newCatCover || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
        type: 'both',
        prompt_count: 0,
      });
      addToast({ title: 'Category Created', message: `"${newCatName}" stored in Supabase.`, type: 'success' });
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      refreshAdminData();
    } catch (err: any) {
      addToast({ title: 'Category Error', message: err.message, type: 'error' });
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName) return;

    const slug = newModelName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      await supabase.from('models').insert({
        name: newModelName,
        slug,
        description: newModelDesc,
        logo_url: 'https://avatar.vercel.sh/' + slug + '.png',
        website_url: 'https://aicorn.design',
        prompt_count: 0,
      });
      addToast({ title: 'AI Model Added', message: `"${newModelName}" stored in Supabase.`, type: 'success' });
      setIsModelModalOpen(false);
      setNewModelName('');
      setNewModelDesc('');
      refreshAdminData();
    } catch (err: any) {
      addToast({ title: 'Model Error', message: err.message, type: 'error' });
    }
  };

  if (isLoadingAuth) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#101010] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#8A867D]">Verifying Supabase authorization...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentUser) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#101010] text-[#D8F651] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Shield className="w-8 h-8 text-[#D8F651]" />
          </div>
          <h1 className="text-3xl font-black text-[#101010] tracking-tight mb-3">
            Authentication Required
          </h1>
          <p className="text-sm text-[#8A867D] mb-8 leading-relaxed max-w-md mx-auto">
            You must be signed in with an authorized administrator account to access the AICORN admin control panel.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="pill-btn px-6 py-3 bg-[#101010] text-[#D8F651] font-black text-sm rounded-full shadow-md"
          >
            Sign In with Clerk
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!isUserAdmin(currentUser)) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0EE] text-[#FF4B26] flex items-center justify-center mx-auto mb-5 border border-[#FFD5CF]">
            <Shield className="w-8 h-8 text-[#FF4B26]" />
          </div>
          <h1 className="text-3xl font-black text-[#101010] tracking-tight mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-[#8A867D] mb-4 leading-relaxed max-w-md mx-auto">
            The AICORN Admin Panel is strictly restricted to the authorized administrator (<span className="font-bold text-[#101010]">{ADMIN_EMAIL}</span>).
          </p>
          <p className="text-xs text-[#8A867D] mb-8 leading-relaxed max-w-md mx-auto">
            Your current account <span className="font-bold text-[#101010]">({currentUser.email})</span> does not have administrator privileges.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="pill-btn px-6 py-2.5 bg-[#101010] text-[#D8F651] font-bold text-xs rounded-full shadow-sm"
            >
              Return to Gallery
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E4DA]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5 text-[#D8F651]" />
              <span>SUPABASE PRODUCTION ADMIN PANEL</span>
            </div>
            <h1 className="text-3xl font-black text-[#101010]">
              Platform Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAdminData}
              className="p-2.5 rounded-full bg-white border border-[#E8E4DA] hover:bg-[#F7F4EE] text-[#101010]"
              title="Refresh from Supabase"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={openCreateModal}
              className="pill-btn px-4 py-2.5 bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-bold text-xs rounded-full flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Prompt</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-2 pb-6 border-b border-[#E8E4DA] mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Metrics', icon: LayoutDashboard },
            { id: 'prompts', label: `Prompts (${dbPrompts.length})`, icon: Sparkles },
            { id: 'skills', label: `Skills (${skills.length})`, icon: Bot },
            { id: 'submissions', label: `Submissions (${pendingSubmissions.length})`, icon: CheckCircle },
            { id: 'categories', label: `Categories (${dbCategories.length})`, icon: Layers },
            { id: 'models', label: `Models (${dbModels.length})`, icon: Video },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#101010] text-[#D8F651]'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#1A1A1A] border border-[#E8E4DA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: METRICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="aicorn-card p-6 bg-white">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">Total Prompts</span>
                <div className="text-3xl font-black text-[#101010] mt-1">{dbPrompts.length}</div>
                <div className="text-xs text-[#8A867D] mt-1">
                  {totalImagePrompts} images &bull; {totalVideoPrompts} videos
                </div>
              </div>

              <div className="aicorn-card p-6 bg-white">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">Submissions</span>
                <div className="text-3xl font-black text-[#101010] mt-1">{pendingSubmissions.length}</div>
                <div className="text-xs text-[#B45309] font-bold mt-1">Awaiting Review</div>
              </div>

              <div className="aicorn-card p-6 bg-white">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">Total Copies</span>
                <div className="text-3xl font-black text-[#101010] mt-1">{totalCopies.toLocaleString()}</div>
                <div className="text-xs text-[#0F5132] font-bold mt-1">Stored in prompt_copies</div>
              </div>

              <div className="aicorn-card p-6 bg-white">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A867D]">Total Views</span>
                <div className="text-3xl font-black text-[#101010] mt-1">{totalViews.toLocaleString()}</div>
                <div className="text-xs text-[#8A867D] mt-1">Stored in prompt_views</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8E4DA] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-[#101010]">
                  Supabase Unified Architecture (Auth + PostgreSQL + Storage)
                </h4>
                <p className="text-xs text-[#8A867D] mt-0.5">
                  Prompts, categories, user auth, and media files (images, videos, thumbnails) are stored natively in Supabase.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="pill-btn px-4 py-2 bg-[#F7F4EE] hover:bg-[#ECE8DF] text-[#101010] text-xs font-bold rounded-full border border-[#E8E4DA]"
                >
                  + Add Category
                </button>
                <button
                  onClick={() => setIsModelModalOpen(true)}
                  className="pill-btn px-4 py-2 bg-[#F7F4EE] hover:bg-[#ECE8DF] text-[#101010] text-xs font-bold rounded-full border border-[#E8E4DA]"
                >
                  + Add AI Model
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROMPTS MANAGEMENT */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#101010]">
                All Prompts ({dbPrompts.length})
              </h3>
              <button
                onClick={openCreateModal}
                className="pill-btn px-4 py-2 bg-[#D8F651] text-[#101010] font-black text-xs rounded-full flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prompt</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden divide-y divide-[#F0EDE6]">
              {dbPrompts.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={p.preview_url}
                      alt={p.title}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#E8E4DA]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#101010] text-[#D8F651]">
                          {p.type}
                        </span>
                        <span className="text-xs font-bold text-[#101010]">{p.category}</span>
                        <span className="text-xs text-[#8A867D]">&bull; {p.model}</span>
                        {p.is_pro && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FF4B26] text-white">
                            PRO
                          </span>
                        )}
                        {p.is_trending && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFF0D4] text-[#B45309]">
                            TRENDING
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#101010]">{p.title}</h4>
                      <p className="text-xs text-[#8A867D] line-clamp-1 max-w-lg mt-0.5">{p.prompt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => updatePrompt(p.id, { is_trending: !p.is_trending })}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        p.is_trending ? 'bg-[#FFF0D4] text-[#B45309] border-[#F4DC96]' : 'bg-[#F7F4EE] text-[#8A867D] border-[#E8E4DA]'
                      }`}
                      title="Toggle Trending"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updatePrompt(p.id, { is_featured: !p.is_featured })}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        p.is_featured ? 'bg-[#101010] text-[#D8F651] border-[#101010]' : 'bg-[#F7F4EE] text-[#8A867D] border-[#E8E4DA]'
                      }`}
                      title="Toggle Featured"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-xl bg-[#F7F4EE] hover:bg-[#ECE8DF] text-[#101010] border border-[#E8E4DA]"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(p.id)}
                      className="p-2 rounded-xl bg-[#FEECEC] hover:bg-[#FDDDDD] text-[#FF4B26] border border-[#FCCECE]"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS MANAGEMENT */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#101010]">
              All AI Agent Skills ({skills.length})
            </h3>
            <div className="bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden divide-y divide-[#F0EDE6]">
              {skills.map((s) => (
                <div key={s.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={s.preview_image} alt={s.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-[#101010]">{s.title}</h4>
                      <p className="text-xs text-[#8A867D]">{s.category} &bull; {s.output_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/skills/${s.id}`}
                      className="p-2 rounded-xl bg-[#F7F4EE] text-[#101010] text-xs font-bold border border-[#E8E4DA]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUBMISSIONS REVIEW */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-[#101010]">
              Community Submissions ({dbSubmissions.length})
            </h3>

            {dbSubmissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl border border-[#E8E4DA] p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#101010] text-[#D8F651]">
                        {sub.type}
                      </span>
                      <span className="text-xs font-bold text-[#8A867D]">{sub.category} &bull; {sub.model}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        sub.status === 'approved' ? 'bg-[#E8F3EE] text-[#0F5132]' : sub.status === 'rejected' ? 'bg-[#FEECEC] text-[#FF4B26]' : 'bg-[#FFF0D4] text-[#B45309]'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-[#101010] mt-1">{sub.title}</h4>
                    <p className="text-xs text-[#8A867D]">Submitted by: {sub.submitted_by} on {sub.created_at}</p>
                  </div>

                  {sub.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveSubmission(sub.id)}
                        className="pill-btn px-4 py-2 bg-[#0F5132] text-white text-xs font-bold rounded-full flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Publish to Supabase</span>
                      </button>
                      <button
                        onClick={() => handleRejectSubmission(sub.id)}
                        className="pill-btn px-4 py-2 bg-[#FF4B26] text-white text-xs font-bold rounded-full flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-[#F7F4EE] rounded-2xl text-xs font-mono text-[#101010]">
                  {sub.prompt}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#101010]">
                All Categories ({dbCategories.length})
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="pill-btn px-4 py-2 bg-[#101010] text-[#D8F651] font-bold text-xs rounded-full flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbCategories.map((c) => (
                <div key={c.slug} className="p-4 rounded-2xl bg-white border border-[#E8E4DA] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#101010]">{c.name}</h4>
                    <p className="text-xs text-[#8A867D]">{c.prompt_count} prompts</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#8A867D] bg-[#F7F4EE] px-2 py-1 rounded">
                    {c.slug}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MODELS MANAGEMENT */}
        {activeTab === 'models' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#101010]">
                AI Models ({dbModels.length})
              </h3>
              <button
                onClick={() => setIsModelModalOpen(true)}
                className="pill-btn px-4 py-2 bg-[#101010] text-[#D8F651] font-bold text-xs rounded-full flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Model</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbModels.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-white border border-[#E8E4DA] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#101010]">{m.name}</h4>
                    <p className="text-xs text-[#8A867D]">{m.badge || 'Verified'}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#8A867D] bg-[#F7F4EE] px-2 py-1 rounded">
                    {m.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-8 space-y-6">
            <h3 className="text-xl font-black text-[#101010]">Supabase Telemetry & Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA]">
                <h4 className="text-xs font-bold uppercase text-[#8A867D] mb-1">Database Queries</h4>
                <div className="text-2xl font-black text-[#101010]">Active & Healthy</div>
                <p className="text-xs text-[#0F5132] font-semibold mt-1">Indexed with GIN full-text</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA]">
                <h4 className="text-xs font-bold uppercase text-[#8A867D] mb-1">Storage Strategy</h4>
                <div className="text-2xl font-black text-[#101010]">Supabase Storage</div>
                <p className="text-xs text-[#0F5132] font-semibold mt-1">Native buckets: prompt-images, prompt-videos</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA]">
                <h4 className="text-xs font-bold uppercase text-[#8A867D] mb-1">Security</h4>
                <div className="text-2xl font-black text-[#101010]">Row Level Security</div>
                <p className="text-xs text-[#0F5132] font-semibold mt-1">Enabled on all tables</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-8 max-w-2xl space-y-6">
            <h3 className="text-xl font-black text-[#101010]">Backend Architecture Configuration</h3>
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] space-y-2 text-xs font-mono">
              <div><span className="font-bold">Project URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured in .env.local'}</div>
              <div><span className="font-bold">Database:</span> Supabase PostgreSQL with RLS Enabled</div>
              <div><span className="font-bold">Auth Provider:</span> Clerk (Supabase Third-Party Auth)</div>
              <div><span className="font-bold">Media Storage:</span> Supabase Storage (prompt-images, prompt-videos, user-submissions)</div>
            </div>
          </div>
        )}

        {/* PROMPT MODAL */}
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white rounded-[28px] border border-[#E8E4DA] shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8">
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-[#8A867D] hover:text-[#101010]"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-black text-[#101010] mb-6">
                {editingPrompt ? 'Edit Prompt in Supabase' : 'Create New Prompt in Supabase'}
              </h3>

              <form onSubmit={handleSavePrompt} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => {
                        const newType = e.target.value as 'image' | 'video';
                        setFormType(newType);
                        const available = (dbModels.length > 0 ? dbModels : AI_MODELS).filter((m) =>
                          newType === 'video' ? m.type === 'video' : m.type !== 'video'
                        );
                        if (!available.some((m) => m.name === formModel)) {
                          setFormModel(newType === 'video' ? 'Kling 1.5' : 'ChatGPT');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold"
                    >
                      {dbCategories.map((c) => (
                        <option key={c.slug} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Prompt Parameters</label>
                  <textarea
                    rows={4}
                    required
                    value={formPrompt}
                    onChange={(e) => setFormPrompt(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#101010] text-[#D8F651] font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Description</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#101010] mb-1">Model</label>
                    <select
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold"
                    >
                      {(dbModels.length > 0 ? dbModels : AI_MODELS)
                        .filter((m) => (formType === 'video' ? m.type === 'video' : m.type !== 'video'))
                        .map((m) => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] mb-1">Style</label>
                    <select
                      value={formStyle}
                      onChange={(e) => setFormStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold"
                    >
                      {['Cinematic', 'Photorealistic', 'Editorial', 'Minimal', 'Luxury', '3D', 'Anime', 'Commercial'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101010] mb-1">Aspect Ratio</label>
                    <select
                      value={formRatio}
                      onChange={(e) => setFormRatio(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-bold"
                    >
                      {['16:9', '9:16', '1:1', '4:5', '3:4'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formType === 'video' && (
                  <div className="p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] space-y-2">
                    <label className="block text-xs font-bold text-[#101010]">
                      Google Drive Video Link / Video Stream URL
                    </label>
                    <input
                      type="url"
                      value={formVideoUrl}
                      onChange={(e) => {
                        setFormVideoUrl(e.target.value);
                        const parsed = parseMediaUrl(e.target.value);
                        if (parsed.isGoogleDrive && parsed.thumbnailUrl && !formPreview) {
                          setFormPreview(parsed.thumbnailUrl);
                        }
                      }}
                      placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                      className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8E4DA] text-xs text-[#101010]"
                    />
                    <p className="text-[11px] text-[#8A867D]">
                      Upload to Google Drive and paste share link here. No storage limits.
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#101010]">
                      {formType === 'video' ? 'Cover / Poster Thumbnail URL' : 'Supabase Storage Media URL'}
                    </label>
                    <label className="text-[11px] font-black text-[#101010] bg-[#D8F651] hover:bg-[#C5E53E] px-2.5 py-0.5 rounded-full cursor-pointer transition-colors flex items-center gap-1 shadow-2xs">
                      {isUploadingMedia ? (
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
                        disabled={isUploadingMedia}
                        onChange={handleMediaUpload}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formPreview}
                    onChange={(e) => setFormPreview(e.target.value)}
                    placeholder="https://njzxalelggtlxaoxxjkk.supabase.co/storage/v1/object/public/prompt-images/..."
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                  {isUploadingMedia && (
                    <p className="text-[11px] text-[#8A867D] mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-[#101010]" /> Uploading media asset directly to Supabase Storage...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#101010] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPro}
                      onChange={(e) => setFormIsPro(e.target.checked)}
                      className="rounded"
                    />
                    <span>Pro Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#101010] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#101010] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsTrending}
                      onChange={(e) => setFormIsTrending(e.target.checked)}
                      className="rounded"
                    />
                    <span>Trending</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-[#F0EDE6]">
                  <button
                    type="button"
                    onClick={() => setIsPromptModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#E8E4DA] text-xs font-bold text-[#101010]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black shadow-sm"
                  >
                    Save to Supabase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY MODAL */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-[28px] border border-[#E8E4DA] shadow-2xl p-6 sm:p-8">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-[#8A867D] hover:text-[#101010]"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-black text-[#101010] mb-4">Add Category to Supabase</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Architectural Visualization"
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description..."
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={newCatCover}
                    onChange={(e) => setNewCatCover(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#E8E4DA] text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black shadow-sm"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODEL MODAL */}
        {isModelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-[28px] border border-[#E8E4DA] shadow-2xl p-6 sm:p-8">
              <button
                onClick={() => setIsModelModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-[#8A867D] hover:text-[#101010]"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-black text-[#101010] mb-4">Add AI Model to Supabase</h3>
              <form onSubmit={handleCreateModel} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="e.g. Veo 3 or Claude 3.7 Sonnet"
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#101010] mb-1">Description</label>
                  <input
                    type="text"
                    value={newModelDesc}
                    onChange={(e) => setNewModelDesc(e.target.value)}
                    placeholder="Model capabilities..."
                    className="w-full px-4 py-2 rounded-2xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModelModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#E8E4DA] text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black shadow-sm"
                  >
                    Save Model
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
