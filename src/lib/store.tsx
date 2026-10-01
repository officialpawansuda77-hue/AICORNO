'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { Prompt, Skill, UserSubmission, UserProfile, Category, AIModel, BlogPostItem } from '@/types';
import { isEmailAdmin } from './authUtils';
import { isCategoryMatch } from './categories';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';
import { OPUS_5_5_VIDEOS } from '@/data/opusVideosData';
import { SKILLS_DATA } from '@/data/skillsData';
import { CATEGORIES as DEFAULT_CATEGORIES, AI_MODELS as DEFAULT_MODELS } from '@/data/categoriesModels';
import { isDirectVideoUrl } from './mediaUtils';
import { supabase } from './supabase';
import {
  fetchPromptsFromDb,
  recordPromptCopyInDb,
  recordPromptViewInDb,
  toggleFavoriteInDb,
  fetchUserFavoritesFromDb,
  fetchCategoriesFromDb,
  fetchModelsFromDb,
  submitPromptToDb,
  fetchSubmissionsFromDb,
  updateSubmissionStatusInDb,
  adminCreatePromptInDb,
  adminUpdatePromptInDb,
  adminDeletePromptInDb,
  mapDbPromptToUI,
} from './supabaseService';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Prompts
  prompts: Prompt[];
  isLoadingPrompts: boolean;
  getPromptById: (id: string) => Prompt | undefined;
  addPrompt: (prompt: Omit<Prompt, 'id' | 'created_at' | 'copies' | 'favorites' | 'views'>) => Promise<Prompt>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  incrementCopies: (id: string) => void;
  recordView: (id: string) => void;

  // Categories & Models
  categories: Category[];
  models: AIModel[];

  // Skills
  skills: Skill[];
  getSkillById: (id: string) => Skill | undefined;
  addSkill: (skill: Omit<Skill, 'id' | 'created_at' | 'installs'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  incrementInstalls: (id: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (id: string) => Promise<boolean>;
  isFavorite: (id: string) => boolean;

  // User Submissions
  submissions: UserSubmission[];
  addSubmission: (submission: Omit<UserSubmission, 'id' | 'created_at' | 'status'>) => Promise<UserSubmission>;
  updateSubmissionStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;

  // Recent Copies
  recentCopies: { id: string; title: string; type: string; timestamp: number }[];

  // Auth / User (Clerk is the sole identity and authentication provider)
  currentUser: UserProfile | null;
  isLoadingAuth: boolean;
  refreshMembership: (optimisticTier?: 'free' | 'starter' | 'pro') => Promise<'free' | 'starter' | 'pro'>;
  login: () => void;
  loginWithGoogle: () => void;
  signUp: () => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Pro Upgrade Modal ($9.99/mo gate) & Plan Selection
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeModalContext: { reason: 'pro_prompt' | 'skill' | 'signin'; itemTitle?: string } | null;
  openUpgradeModal: (context: { reason: 'pro_prompt' | 'skill' | 'signin'; itemTitle?: string }) => void;

  // Home Featured Prompts
  homeFeatured: { imagePromptId?: string; videoPromptId?: string; skillId?: string };
  setHomeFeatured: (featured: { imagePromptId?: string; videoPromptId?: string; skillId?: string }) => void;

  // Dynamic Blog & Social Posts
  blogPosts: BlogPostItem[];
  addBlogPostItem: (item: Omit<BlogPostItem, 'id' | 'date'>) => void;
  deleteBlogPostItem: (id: string) => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useAuth();
  const { openSignIn, openSignUp } = useClerk();

  // Pre-seed with canonical data so the UI renders in 0ms without waiting for network calls
  const [prompts, setPrompts] = useState<Prompt[]>(() => [...IMAGE_PROMPTS, ...VIDEO_PROMPTS]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [skills, setSkills] = useState<Skill[]>(SKILLS_DATA);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [recentCopies, setRecentCopies] = useState<{ id: string; title: string; type: string; timestamp: number }[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('aicorn_user_profile');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('aicorn_user_profile')) return false;
      } catch {}
    }
    return true;
  });
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Pro Upgrade Modal state
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState<{ reason: 'pro_prompt' | 'skill' | 'signin'; itemTitle?: string } | null>(null);

  // Home Featured Prompts
  const [homeFeatured, setHomeFeaturedState] = useState<{ imagePromptId?: string; videoPromptId?: string; skillId?: string }>({});

  // Dynamic Blog & Social Posts
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);

  const refreshMembership = useCallback(async (optimisticTier?: 'free' | 'starter' | 'pro'): Promise<'free' | 'starter' | 'pro'> => {
    if (!user?.id) throw new Error('Sign in required');
    try {
      if (typeof (user as any).reload === 'function') {
        await (user as any).reload();
      }
    } catch {}

    let tier: 'free' | 'starter' | 'pro' = optimisticTier || 'free';
    let hasBillingAccount = tier !== 'free';

    try {
      const response = await fetch(`/api/billing/status?userId=${encodeURIComponent(user.id)}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.tier === 'free' || data.tier === 'starter' || data.tier === 'pro') {
          tier = data.tier;
          hasBillingAccount = Boolean(data.hasBillingAccount);
        }
      }
    } catch (err) {
      console.warn('[refreshMembership] status query warning:', err);
    }

    if (optimisticTier && (optimisticTier === 'pro' || optimisticTier === 'starter')) {
      tier = optimisticTier;
      hasBillingAccount = true;
    }

    setCurrentUser((previous) => {
      const email = previous?.email || user.primaryEmailAddress?.emailAddress || '';
      const isOwnerAdmin = isEmailAdmin(email);
      const metaMembershipStr = String(user.publicMetadata?.membership || '').toLowerCase().trim();
      const isProUser = previous?.role === 'admin' || isOwnerAdmin || Boolean(user.publicMetadata?.is_pro) || metaMembershipStr === 'pro' || tier === 'pro';
      const effectiveTier: 'free' | 'starter' | 'pro' = isProUser ? 'pro' : (tier !== 'free' ? tier : (metaMembershipStr === 'starter' ? 'starter' : 'free'));

      const updated: UserProfile = {
        id: user.id,
        name: previous?.name || user.fullName || user.firstName || email.split('@')[0] || 'Creator',
        handle: previous?.handle || (user.username ? `@${user.username}` : `@${email.split('@')[0] || 'creator'}`),
        email,
        avatar: user.imageUrl || previous?.avatar || `https://avatar.vercel.sh/${email || user.id}.png`,
        role: isOwnerAdmin ? 'admin' : (previous?.role || 'user'),
        membership: effectiveTier,
        has_billing_account: hasBillingAccount || effectiveTier !== 'free',
        is_pro: isProUser || effectiveTier === 'pro',
        joined_date: previous?.joined_date || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'),
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aicorn_user_profile', JSON.stringify(updated));
        } catch {}
      }

      return updated;
    });

    return tier;
  }, [user]);

  // 1. Initial Load: Instant local hydration + background remote sync (Zero UI blocking)
  useEffect(() => {
    let isMounted = true;

    // A. Instant Local Hydration (0ms)
    if (typeof window !== 'undefined') {
      try {
        const savedFavs = JSON.parse(localStorage.getItem('aicorn_favorites') || '[]');
        if (isMounted && savedFavs.length > 0) setFavorites(savedFavs);
      } catch {}
      try {
        const savedFeat = JSON.parse(localStorage.getItem('aicorn_home_featured') || '{}');
        if (isMounted && Object.keys(savedFeat).length > 0) setHomeFeaturedState(savedFeat);
      } catch {}
      try {
        const savedBlog = JSON.parse(localStorage.getItem('aicorn_blog_posts') || '[]');
        if (isMounted && savedBlog.length > 0) setBlogPosts(savedBlog);
      } catch {}

      // Hydrate custom prompts created by user/admin locally
      try {
        const localCustom: Prompt[] = JSON.parse(localStorage.getItem('aicorn_local_prompts') || '[]');
        if (isMounted && localCustom.length > 0) {
          setPrompts((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const uniqueExtra = localCustom.filter((p) => !seen.has(p.id));
            return uniqueExtra.length > 0 ? [...uniqueExtra, ...prev] : prev;
          });
        }
      } catch {}

      // Hydrate custom skills created locally
      try {
        const localSkills: Skill[] = JSON.parse(localStorage.getItem('aicorn_local_skills') || '[]');
        if (isMounted && localSkills.length > 0) {
          setSkills((prev) => {
            const seen = new Set(prev.map((s) => s.id));
            const uniqueExtra = localSkills.filter((s) => !seen.has(s.id));
            return uniqueExtra.length > 0 ? [...uniqueExtra, ...prev] : prev;
          });
        }
      } catch {}

      // Hydrate submissions
      try {
        const localSubs: UserSubmission[] = JSON.parse(localStorage.getItem('aicorn_local_submissions') || '[]');
        if (isMounted && localSubs.length > 0) {
          setSubmissions((prev) => {
            const seen = new Set(prev.map((s) => s.id));
            const uniqueExtra = localSubs.filter((s) => !seen.has(s.id));
            return uniqueExtra.length > 0 ? [...uniqueExtra, ...prev] : prev;
          });
        }
      } catch {}
    }

    // B. Background Remote Sync (Non-blocking: page already has all canonical content)
    async function backgroundSync() {
      try {
        const [promptsRes, subs] = await Promise.allSettled([
          fetchPromptsFromDb({ limit: 100 }),
          fetchSubmissionsFromDb(),
        ]);

        if (!isMounted) return;

        if (promptsRes.status === 'fulfilled' && promptsRes.value?.prompts && promptsRes.value.prompts.length > 0) {
          setPrompts((prev) => {
            const map = new Map<string, Prompt>();
            // Keep remote prompts
            for (const p of promptsRes.value.prompts) map.set(p.id, p);
            // Keep local custom prompts
            for (const p of prev) {
              if (!map.has(p.id)) map.set(p.id, p);
            }
            return Array.from(map.values());
          });
        }

        if (subs.status === 'fulfilled' && subs.value && subs.value.length > 0) {
          setSubmissions((prev) => {
            const seen = new Set(prev.map((s) => s.id));
            const extra = subs.value.filter((s) => !seen.has(s.id));
            return extra.length > 0 ? [...prev, ...extra] : prev;
          });
        }
      } catch (err) {
        console.warn('[Sync Notice]:', err);
      }
    }

    void backgroundSync();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Profile Sync with Clerk Identity & Supabase PostgreSQL
  useEffect(() => {
    let isMounted = true;

    async function syncClerkUserToSupabase(clerkUser: typeof user) {
      if (!clerkUser) return;

      try {
        let profile = null;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', clerkUser.id)
            .maybeSingle();

          if (!error && data) {
            profile = data;
            const email = clerkUser.primaryEmailAddress?.emailAddress || '';
            const isOwnerAdmin = isEmailAdmin(email);
            if (isOwnerAdmin && profile.role !== 'admin') {
              try {
                await supabase.from('profiles').update({ role: 'admin' }).eq('user_id', clerkUser.id);
                profile.role = 'admin';
              } catch (pErr) {
                console.warn('[Admin Promotion Notice]:', pErr);
              }
            }
          }
        } catch {
          // Schema may use UUID for user_id; Clerk ID is string, ignore safely
        }

        const email = clerkUser.primaryEmailAddress?.emailAddress || '';
        const isOwnerAdmin = isEmailAdmin(email);
        const role: 'admin' | 'user' = isOwnerAdmin ? 'admin' : 'user';
        const metaMembershipStr = String(clerkUser.publicMetadata?.membership || '').toLowerCase().trim();
        const isProUser = role === 'admin' || metaMembershipStr === 'pro' || Boolean(clerkUser.publicMetadata?.is_pro);
        const userMembership: 'free' | 'starter' | 'pro' = isProUser ? 'pro' : (metaMembershipStr === 'starter' ? 'starter' : 'free');

        const userProfile: UserProfile = {
          id: clerkUser.id,
          name: profile?.name || clerkUser.fullName || clerkUser.firstName || email.split('@')[0] || 'Creator',
          handle: clerkUser.username ? `@${clerkUser.username}` : `@${email.split('@')[0] || 'creator'}`,
          email,
          avatar: clerkUser.imageUrl || profile?.avatar_url || `https://avatar.vercel.sh/${email || clerkUser.id}.png`,
          role,
          is_pro: isProUser,
          membership: userMembership,
          has_billing_account: userMembership !== 'free',
          joined_date: clerkUser.createdAt
            ? new Date(clerkUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'March 2026',
        };

        if (isMounted) {
          setCurrentUser((prev) => {
            const effectiveMembership = prev?.membership && prev.membership !== 'free' ? prev.membership : userProfile.membership;
            const effectiveIsPro = effectiveMembership === 'pro' || userProfile.is_pro;
            const updated = {
              ...userProfile,
              membership: effectiveMembership,
              is_pro: effectiveIsPro,
              has_billing_account: effectiveMembership !== 'free',
            };
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('aicorn_user_profile', JSON.stringify(updated)); } catch {}
            }
            return updated;
          });
          // Entitlements come from the authenticated server endpoint, not the checkout URL.
          void refreshMembership().catch(() => {});
        }

        // Fetch user favorites from Supabase and merge with local favorites
        const userFavs = await fetchUserFavoritesFromDb(clerkUser.id);
        if (isMounted && userFavs && userFavs.length > 0) {
          const dbFavIds = userFavs.map((p) => p.id);
          setFavorites((prev) => {
            const merged = Array.from(new Set([...prev, ...dbFavIds]));
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('aicorn_favorites', JSON.stringify(merged));
              } catch {}
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Sync Clerk user to Supabase error:', err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }

    if (!isUserLoaded) {
      return;
    }

    if (isSignedIn && user) {
      // 1. Immediately set profile and persist so Header & UI reflect login in 0ms!
      const email = user.primaryEmailAddress?.emailAddress || '';
      const isOwnerAdmin = isEmailAdmin(email);
      const role: 'admin' | 'user' = isOwnerAdmin ? 'admin' : 'user';
      const metaMembershipStr = String(user.publicMetadata?.membership || '').toLowerCase().trim();
      const isProUser = role === 'admin' || metaMembershipStr === 'pro' || Boolean(user.publicMetadata?.is_pro);
      const metaMembership: 'free' | 'starter' | 'pro' = isProUser ? 'pro' : (metaMembershipStr === 'starter' ? 'starter' : 'free');

      setCurrentUser((prev) => {
        // If previous user already had pro/starter, don't downgrade it unless Clerk explicitly says otherwise
        const effectiveMembership = (prev?.id === user.id && prev.membership !== 'free' && metaMembership === 'free')
          ? prev.membership
          : metaMembership;
        const effectiveIsPro = effectiveMembership === 'pro' || isProUser;

        const merged: UserProfile = {
          id: user.id,
          name: user.fullName || user.firstName || email.split('@')[0] || 'Creator',
          handle: user.username ? `@${user.username}` : `@${email.split('@')[0] || 'creator'}`,
          email,
          avatar: user.imageUrl || `https://avatar.vercel.sh/${email || user.id}.png`,
          role,
          is_pro: effectiveIsPro,
          membership: effectiveMembership,
          has_billing_account: effectiveMembership !== 'free',
          joined_date: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : '2026',
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('aicorn_user_profile', JSON.stringify(merged));
          } catch {}
        }

        return merged;
      });
      setIsLoadingAuth(false);

      // 2. Perform background sync to Supabase and membership check
      void syncClerkUserToSupabase(user);
    } else {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('aicorn_user_profile');
        } catch {}
      }
      setCurrentUser(null);
      // Keep local favorites intact for guests/refresh
      setIsLoadingAuth(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isUserLoaded, isSignedIn, user, refreshMembership]);

  // Toast handlers
  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 2b. Auto-checkout watcher: If user selected Starter or Pro before signing in, redirect immediately to Dodo Payments
  useEffect(() => {
    if (!isUserLoaded || !isSignedIn || !user) return;
    if (typeof window === 'undefined') return;

    const pendingPlan = localStorage.getItem('aicorn_pending_plan');
    if (pendingPlan === 'starter' || pendingPlan === 'pro') {
      localStorage.removeItem('aicorn_pending_plan');
      addToast({
        title: `Activating ${pendingPlan === 'pro' ? 'Pro Unlimited ($9.99/mo)' : 'Starter ($4.49/mo)'}`,
        message: 'Redirecting to secure Dodo Payments checkout...',
        type: 'info',
      });

      void (async () => {
        try {
          let token: string | null = null;
          try { token = await getToken(); } catch {}

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              plan: pendingPlan,
              userId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress,
            }),
          });
          const data = await res.json();
          if (data?.url) {
            window.location.assign(data.url);
          } else {
            addToast({
              title: 'Checkout notice',
              message: data?.error || 'Could not start checkout automatically.',
              type: 'error',
            });
          }
        } catch (err: any) {
          addToast({
            title: 'Checkout error',
            message: err?.message || 'Could not start checkout automatically.',
            type: 'error',
          });
        }
      })();
    }
  }, [isUserLoaded, isSignedIn, user?.id, addToast, getToken]);

  // Prompts operations
  const getPromptById = useCallback((id: string) => {
    return prompts.find((p) => p.id === id) || OPUS_5_5_VIDEOS.find((p) => p.id === id);
  }, [prompts]);

  const addPrompt = useCallback(async (data: Omit<Prompt, 'id' | 'created_at' | 'copies' | 'favorites' | 'views'>): Promise<Prompt> => {
    let createdDb = await adminCreatePromptInDb(data);
    if (!createdDb) {
      try {
        const res = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (resData.prompt) {
          createdDb = mapDbPromptToUI(resData.prompt);
        }
      } catch (err) {
        console.warn('API prompt fallback notice:', err);
      }
    }

    const resolvedVideo = data.video_url || (createdDb?.video_url) || (data.type === 'video' && isDirectVideoUrl(data.preview_url) ? data.preview_url : undefined);

    const newPrompt: Prompt = {
      ...(createdDb || data),
      id: createdDb?.id || `${data.type === 'video' ? 'vid' : 'img'}-${Date.now()}`,
      video_url: resolvedVideo,
      author: data.author || createdDb?.author || {
        name: currentUser?.name || 'Creator',
        handle: currentUser?.handle || '@creator',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      },
      created_at: createdDb?.created_at || new Date().toISOString().split('T')[0],
      copies: createdDb?.copies ?? 0,
      favorites: createdDb?.favorites ?? 0,
      views: createdDb?.views ?? 1,
    };

    setPrompts((prev) => [
      newPrompt,
      ...prev.filter(
        (p) =>
          p.id !== newPrompt.id &&
          !(p.title.trim().toLowerCase() === newPrompt.title.trim().toLowerCase() && p.preview_url === newPrompt.preview_url)
      ),
    ]);

    // Persist newly created prompt to localStorage
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('aicorn_local_prompts') || '[]');
        const updated = [
          newPrompt,
          ...existing.filter(
            (p: Prompt) =>
              p.id !== newPrompt.id &&
              !(p.title.trim().toLowerCase() === newPrompt.title.trim().toLowerCase() && p.preview_url === newPrompt.preview_url)
          ),
        ];
        localStorage.setItem('aicorn_local_prompts', JSON.stringify(updated.slice(0, 50)));
      } catch {
        // ignore
      }
    }

    addToast({ title: 'Prompt Published!', message: `"${data.title}" is now live in the gallery.`, type: 'success' });
    return newPrompt;
  }, [currentUser, addToast]);

  const updatePrompt = useCallback(async (id: string, updates: Partial<Prompt>) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    await adminUpdatePromptInDb(id, updates);
    addToast({ title: 'Prompt Updated', message: 'Changes saved to Supabase.', type: 'success' });
  }, [addToast]);

  const deletePrompt = useCallback(async (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    await adminDeletePromptInDb(id);
    addToast({ title: 'Prompt Deleted', type: 'info' });
  }, [addToast]);

  const incrementCopies = useCallback((id: string) => {
    let copiedTitle = '';
    let copiedType = 'image';

    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          copiedTitle = p.title;
          copiedType = p.type;
          const newCopies = (p.copies || 0) + 1;
          if (typeof window !== 'undefined') {
            try {
              const stats = JSON.parse(localStorage.getItem('aicorn_prompt_stats') || '{}');
              stats[id] = { ...stats[id], copies: newCopies };
              localStorage.setItem('aicorn_prompt_stats', JSON.stringify(stats));

              const localPrompts = JSON.parse(localStorage.getItem('aicorn_local_prompts') || '[]');
              const updatedLocal = localPrompts.map((lp: Prompt) => (lp.id === id ? { ...lp, copies: newCopies } : lp));
              localStorage.setItem('aicorn_local_prompts', JSON.stringify(updatedLocal));
            } catch {}
          }
          return { ...p, copies: newCopies };
        }
        return p;
      })
    );

    if (copiedTitle) {
      setRecentCopies((prev) => [
        { id, title: copiedTitle, type: copiedType, timestamp: Date.now() },
        ...prev.filter((r) => r.id !== id).slice(0, 19),
      ]);
    }

    // Record copy in Supabase (via API endpoint with service role)
    recordPromptCopyInDb(id, currentUser?.id);
  }, [currentUser?.id]);

  const recordView = useCallback((id: string) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newViews = (p.views || 0) + 1;
          if (typeof window !== 'undefined') {
            try {
              const stats = JSON.parse(localStorage.getItem('aicorn_prompt_stats') || '{}');
              stats[id] = { ...stats[id], views: newViews };
              localStorage.setItem('aicorn_prompt_stats', JSON.stringify(stats));
            } catch {}
          }
          return { ...p, views: newViews };
        }
        return p;
      })
    );

    recordPromptViewInDb(id, currentUser?.id);
  }, [currentUser?.id]);

  // Skills operations
  const getSkillById = useCallback((id: string) => {
    return skills.find((s) => s.id === id);
  }, [skills]);

  const addSkill = useCallback((data: Omit<Skill, 'id' | 'created_at' | 'installs'>) => {
    const newSkill: Skill = {
      ...data,
      id: `skill-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      installs: 0,
    };
    setSkills((prev) => [newSkill, ...prev]);
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('aicorn_local_skills') || '[]');
        localStorage.setItem('aicorn_local_skills', JSON.stringify([newSkill, ...existing].slice(0, 50)));
      } catch {
        // ignore
      }
    }
    // Also register in submissions for Admin review and counting
    const newSub: UserSubmission = {
      title: data.title,
      type: 'skill',
      description: data.description,
      prompt: data.install_prompt || data.instructions?.join('\n') || '',
      category: data.category,
      model: data.compatible_agents?.[0] || 'Claude Code',
      style: data.output_type || 'Workflow',
      aspect_ratio: '16:9',
      preview_url: data.preview_image,
      tags: data.tags || ['skill', 'ai'],
      submitted_by: currentUser?.email || 'creator@aicorn.design',
      id: `sub-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0],
    };
    setSubmissions((prev) => [newSub, ...prev]);
    if (typeof window !== 'undefined') {
      try {
        const existingSubs = JSON.parse(localStorage.getItem('aicorn_local_submissions') || '[]');
        localStorage.setItem('aicorn_local_submissions', JSON.stringify([newSub, ...existingSubs].slice(0, 50)));
      } catch {
        // ignore
      }
    }
    addToast({ title: 'Skill Added!', message: `"${data.title}" added to catalog.`, type: 'success' });
  }, [currentUser?.email, addToast]);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast({ title: 'Skill Updated', type: 'success' });
  }, [addToast]);

  const deleteSkill = useCallback((id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    addToast({ title: 'Skill Deleted', type: 'info' });
  }, [addToast]);

  const incrementInstalls = useCallback((id: string) => {
    const target = skills.find((s) => s.id === id);
    if (!target) return;
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, installs: s.installs + 1 } : s))
    );
    setRecentCopies((prev) => [
      { id, title: target.title, type: 'skill', timestamp: Date.now() },
      ...prev.filter((r) => r.id !== id).slice(0, 19),
    ]);
  }, [skills]);

  // Favorite toggle (Works for both logged-in users and guests, completely persistent across refreshes)
  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    let nextStatus = false;
    setFavorites((prev) => {
      const exists = prev.includes(id);
      nextStatus = !exists;
      const nextFavorites = exists ? prev.filter((f) => f !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aicorn_favorites', JSON.stringify(nextFavorites));
        } catch {}
      }
      return nextFavorites;
    });

    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newFavCount = Math.max(0, (p.favorites || 0) + (nextStatus ? 1 : -1));
          if (typeof window !== 'undefined') {
            try {
              const stats = JSON.parse(localStorage.getItem('aicorn_prompt_stats') || '{}');
              stats[id] = { ...stats[id], favorites: newFavCount };
              localStorage.setItem('aicorn_prompt_stats', JSON.stringify(stats));
            } catch {}
          }
          return { ...p, favorites: newFavCount };
        }
        return p;
      })
    );

    if (currentUser?.id) {
      toggleFavoriteInDb(id, currentUser.id).catch(() => {});
    }

    if (!nextStatus) {
      addToast({ title: 'Removed from Favorites', type: 'info' });
      return false;
    } else {
      addToast({ title: 'Saved to Favorites', type: 'success' });
      return true;
    }
  }, [currentUser?.id, addToast]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  // Pro Upgrade Modal opener
  const openUpgradeModal = useCallback((context: { reason: 'pro_prompt' | 'skill' | 'signin'; itemTitle?: string }) => {
    setUpgradeModalContext(context);
    setUpgradeModalOpen(true);
  }, []);

  // Home Featured Prompts handler
  const setHomeFeatured = useCallback((featured: { imagePromptId?: string; videoPromptId?: string; skillId?: string }) => {
    setHomeFeaturedState(featured);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aicorn_home_featured', JSON.stringify(featured));
      } catch {}
    }
    addToast({ title: 'Homepage Featured Updated', message: 'Homepage Explore cards updated with selected media.', type: 'success' });
  }, [addToast]);

  // Dynamic Blog & Social Posts handlers
  const addBlogPostItem = useCallback((item: Omit<BlogPostItem, 'id' | 'date'>) => {
    const newItem: BlogPostItem = {
      ...item,
      id: `post-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setBlogPosts((prev) => {
      const updated = [newItem, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aicorn_blog_posts', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    addToast({ title: 'Update Published!', message: `"${item.title}" added to posts.`, type: 'success' });
  }, []);

  const deleteBlogPostItem = useCallback((id: string) => {
    setBlogPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aicorn_blog_posts', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    addToast({ title: 'Post Deleted', type: 'info' });
  }, []);

  // Submissions (Supabase + Local)
  const addSubmission = useCallback(async (data: Omit<UserSubmission, 'id' | 'created_at' | 'status'>) => {
    submitPromptToDb(data, currentUser?.id).catch(() => {});

    const newSub: UserSubmission = {
      ...data,
      id: `sub-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0],
    };
    setSubmissions((prev) => [newSub, ...prev]);
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('aicorn_local_submissions') || '[]');
        localStorage.setItem('aicorn_local_submissions', JSON.stringify([newSub, ...existing].slice(0, 50)));
      } catch {
        // ignore
      }
    }

    return newSub;
  }, [currentUser?.id]);

  const updateSubmissionStatus = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );

    await updateSubmissionStatusInDb(id, status);

    if (status === 'approved') {
      await addPrompt({
        title: target.title,
        type: (target.type === 'skill' ? 'image' : target.type) as 'image' | 'video',
        prompt: target.prompt,
        description: target.description,
        category: target.category,
        subcategory: 'Community',
        model: target.model,
        style: target.style || 'Photorealistic',
        aspect_ratio: (target.aspect_ratio as any) || '16:9',
        preview_url: target.preview_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        tags: target.tags,
        author: {
          name: currentUser?.name || 'Creator',
          handle: currentUser?.handle || '@creator',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        },
        rating: 5.0,
        is_pro: false,
        is_featured: false,
        is_trending: true,
      });
    }

    addToast({
      title: status === 'approved' ? 'Submission Approved!' : 'Submission Rejected',
      type: status === 'approved' ? 'success' : 'info',
    });
  }, [submissions, addPrompt, currentUser, addToast]);

  // Clerk Auth Triggers
  const login = useCallback(() => {
    openSignIn();
  }, [openSignIn]);

  const loginWithGoogle = useCallback(() => {
    openSignIn();
  }, [openSignIn]);

  const signUp = useCallback(() => {
    openSignUp();
  }, [openSignUp]);

  const logout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aicorn_user_profile');
        localStorage.removeItem('aicorn_pending_plan');
      }
      await signOut();
    } catch (e) {
      console.warn('Clerk sign out warning:', e);
    }
    setCurrentUser(null);
    addToast({ title: 'Signed Out', message: 'You are now browsing as guest.', type: 'info' });
  }, [signOut, addToast]);

  const contextValue = useMemo(() => ({
    prompts,
    isLoadingPrompts,
    getPromptById,
    refreshMembership,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementCopies,
    recordView,
    categories,
    models,
    skills,
    getSkillById,
    addSkill,
    updateSkill,
    deleteSkill,
    incrementInstalls,
    favorites,
    toggleFavorite,
    isFavorite,
    submissions,
    addSubmission,
    updateSubmissionStatus,
    recentCopies,
    currentUser,
    isLoadingAuth,
    login,
    loginWithGoogle,
    signUp,
    logout,
    isAuthModalOpen,
    setAuthModalOpen,
    isUpgradeModalOpen,
    setUpgradeModalOpen,
    upgradeModalContext,
    openUpgradeModal,
    homeFeatured,
    setHomeFeatured,
    blogPosts,
    addBlogPostItem,
    deleteBlogPostItem,
    toasts,
    addToast,
    removeToast,
  }), [
    prompts,
    isLoadingPrompts,
    getPromptById,
    refreshMembership,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementCopies,
    recordView,
    categories,
    models,
    skills,
    getSkillById,
    addSkill,
    updateSkill,
    deleteSkill,
    incrementInstalls,
    favorites,
    toggleFavorite,
    isFavorite,
    submissions,
    addSubmission,
    updateSubmissionStatus,
    recentCopies,
    currentUser,
    isLoadingAuth,
    login,
    loginWithGoogle,
    signUp,
    logout,
    isAuthModalOpen,
    isUpgradeModalOpen,
    upgradeModalContext,
    openUpgradeModal,
    homeFeatured,
    setHomeFeatured,
    blogPosts,
    addBlogPostItem,
    deleteBlogPostItem,
    toasts,
    addToast,
    removeToast,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
