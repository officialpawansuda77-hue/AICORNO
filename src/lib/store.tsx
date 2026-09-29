'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { Prompt, Skill, UserSubmission, UserProfile, Category, AIModel, BlogPostItem } from '@/types';
import { isEmailAdmin } from './authUtils';
import { isCategoryMatch } from './categories';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';
import { SKILLS_DATA } from '@/data/skillsData';
import { CATEGORIES as DEFAULT_CATEGORIES, AI_MODELS as DEFAULT_MODELS } from '@/data/categoriesModels';
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
  addSubmission: (submission: Omit<UserSubmission, 'id' | 'created_at' | 'status'>) => Promise<Prompt>;
  updateSubmissionStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;

  // Recent Copies
  recentCopies: { id: string; title: string; type: string; timestamp: number }[];

  // Auth / User (Clerk is the sole identity and authentication provider)
  currentUser: UserProfile | null;
  isLoadingAuth: boolean;
  login: () => void;
  loginWithGoogle: () => void;
  signUp: () => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Pro Upgrade Modal ($9.99/mo gate)
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeModalContext: { reason: 'pro_prompt' | 'skill'; itemTitle?: string } | null;
  openUpgradeModal: (context: { reason: 'pro_prompt' | 'skill'; itemTitle?: string }) => void;

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
  const { signOut } = useAuth();
  const { openSignIn, openSignUp } = useClerk();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [recentCopies, setRecentCopies] = useState<{ id: string; title: string; type: string; timestamp: number }[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Pro Upgrade Modal state
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState<{ reason: 'pro_prompt' | 'skill'; itemTitle?: string } | null>(null);

  // Home Featured Prompts
  const [homeFeatured, setHomeFeaturedState] = useState<{ imagePromptId?: string; videoPromptId?: string; skillId?: string }>({});

  // Dynamic Blog & Social Posts
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);

  // 1. Initial Load: Sync database categories, models, prompts, submissions from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingPrompts(true);
      try {
        // Immediately initialize favorites from localStorage so UI is instant & persistent
        let savedFavs: string[] = [];
        if (typeof window !== 'undefined') {
          try {
            savedFavs = JSON.parse(localStorage.getItem('aicorn_favorites') || '[]');
            if (isMounted && savedFavs.length > 0) {
              setFavorites(savedFavs);
            }
          } catch {}
          try {
            const savedFeat = JSON.parse(localStorage.getItem('aicorn_home_featured') || '{}');
            if (isMounted) setHomeFeaturedState(savedFeat);
          } catch {}
          try {
            const savedBlog = JSON.parse(localStorage.getItem('aicorn_blog_posts') || '[]');
            if (isMounted) setBlogPosts(savedBlog);
          } catch {}
        }

        const [cats, mods, promptsRes, subs] = await Promise.all([
          fetchCategoriesFromDb(),
          fetchModelsFromDb(),
          fetchPromptsFromDb({ limit: 100 }),
          fetchSubmissionsFromDb(),
        ]);

        if (isMounted) {
          let localCustom: Prompt[] = [];
          if (typeof window !== 'undefined') {
            try {
              localCustom = JSON.parse(localStorage.getItem('aicorn_local_prompts') || '[]');
            } catch {
              // ignore
            }
          }

          const basePrompts = promptsRes?.prompts || [];

          // Deduplicate prompts by ID, prioritizing newly created local prompts
          const seen = new Set<string>();
          const loadedPrompts: Prompt[] = [];
          for (const p of [...localCustom, ...basePrompts]) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              loadedPrompts.push(p);
            }
          }

          // Merge persistent copies, views, and favorites counts from localStorage
          let promptStats: Record<string, { copies?: number; views?: number; favorites?: number }> = {};
          if (typeof window !== 'undefined') {
            try {
              promptStats = JSON.parse(localStorage.getItem('aicorn_prompt_stats') || '{}');
            } catch {}
          }

          const finalPrompts = loadedPrompts.map((p) => {
            const st = promptStats[p.id];
            if (!st) return p;
            return {
              ...p,
              copies: st.copies !== undefined ? st.copies : p.copies,
              views: st.views !== undefined ? st.views : p.views,
              favorites: st.favorites !== undefined ? st.favorites : p.favorites,
            };
          });

          // Load skills (SKILLS_DATA + local user skills)
          let localSkills: Skill[] = [];
          if (typeof window !== 'undefined') {
            try {
              localSkills = JSON.parse(localStorage.getItem('aicorn_local_skills') || '[]');
            } catch {
              // ignore
            }
          }
          const allSkills = [...localSkills, ...SKILLS_DATA];
          const seenSkills = new Set<string>();
          setSkills(allSkills.filter((s) => {
            if (seenSkills.has(s.id)) return false;
            seenSkills.add(s.id);
            return true;
          }));

          // Load submissions (database + local submissions)
          let localSubs: UserSubmission[] = [];
          if (typeof window !== 'undefined') {
            try {
              localSubs = JSON.parse(localStorage.getItem('aicorn_local_submissions') || '[]');
            } catch {
              // ignore
            }
          }
          const allSubs = [...localSubs, ...(subs || [])];
          const seenSubs = new Set<string>();
          setSubmissions(allSubs.filter((s) => {
            if (seenSubs.has(s.id)) return false;
            seenSubs.add(s.id);
            return true;
          }));

          setPrompts(finalPrompts);
          setCategories((cats && cats.length > 0 ? cats : DEFAULT_CATEGORIES).map((category) => ({
            ...category,
            prompt_count: finalPrompts.filter((prompt) =>
              prompt.category === category.name || prompt.category === category.slug
            ).length,
          })));
          if (mods && mods.length > 0) setModels(mods);
        }
      } catch (e) {
        console.warn('Initial Supabase sync fallback:', e);
      } finally {
        if (isMounted) setIsLoadingPrompts(false);
      }
    }

    loadData();
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
        // Attempt to fetch profile from public.profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', clerkUser.id)
          .maybeSingle();

        const email = clerkUser.primaryEmailAddress?.emailAddress || '';
        const isOwnerAdmin = isEmailAdmin(email);

        if (!error && data) {
          profile = data;
          // If this is the owner admin but role in Supabase is not yet 'admin', promote immediately
          if (isOwnerAdmin && profile.role !== 'admin') {
            try {
              await supabase.from('profiles').update({ role: 'admin' }).eq('user_id', clerkUser.id);
              profile.role = 'admin';
            } catch (pErr) {
              console.warn('[Admin Promotion Notice]:', pErr);
            }
          }
        } else {
          // If profile does not exist yet in Supabase, sync initial profile row
          const fullName = clerkUser.fullName || clerkUser.firstName || email.split('@')[0] || 'Creator';
          const initialProfile = {
            id: clerkUser.id,
            user_id: clerkUser.id,
            name: fullName,
            avatar_url: clerkUser.imageUrl || `https://avatar.vercel.sh/${email || clerkUser.id}.png`,
            role: isOwnerAdmin ? 'admin' : 'user',
          };
          try {
            await supabase.from('profiles').upsert(initialProfile, { onConflict: 'user_id' });
          } catch (upsertErr) {
            console.warn('[Profile Sync] Upsert notice:', upsertErr);
          }
          profile = initialProfile;
        }

        // Strict rule: Only sudapawan301@gmail.com can be recognized as admin
        const role: 'admin' | 'user' = isOwnerAdmin ? 'admin' : 'user';
        const userProfile: UserProfile = {
          id: clerkUser.id,
          name: profile?.name || clerkUser.fullName || clerkUser.firstName || email.split('@')[0] || 'Creator',
          handle: clerkUser.username ? `@${clerkUser.username}` : `@${email.split('@')[0] || 'creator'}`,
          email,
          avatar: clerkUser.imageUrl || profile?.avatar_url || `https://avatar.vercel.sh/${email || clerkUser.id}.png`,
          role,
          is_pro: role === 'admin',
          joined_date: clerkUser.createdAt
            ? new Date(clerkUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'March 2026',
        };

        if (isMounted) {
          setCurrentUser(userProfile);
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
      syncClerkUserToSupabase(user);
    } else {
      setCurrentUser(null);
      // Keep local favorites intact for guests/refresh
      setIsLoadingAuth(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isUserLoaded, isSignedIn, user]);

  // Toast handlers
  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Prompts operations
  const getPromptById = (id: string) => {
    return prompts.find((p) => p.id === id);
  };

  const addPrompt = async (data: Omit<Prompt, 'id' | 'created_at' | 'copies' | 'favorites' | 'views'>): Promise<Prompt> => {
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

    const newPrompt: Prompt = createdDb || {
      ...data,
      id: `${data.type === 'video' ? 'vid' : 'img'}-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      copies: 0,
      favorites: 0,
      views: 1,
    };

    setPrompts((prev) => [newPrompt, ...prev.filter((p) => p.id !== newPrompt.id)]);

    // Persist newly created prompt to localStorage
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('aicorn_local_prompts') || '[]');
        const updated = [newPrompt, ...existing.filter((p: Prompt) => p.id !== newPrompt.id)];
        localStorage.setItem('aicorn_local_prompts', JSON.stringify(updated.slice(0, 50)));
      } catch {
        // ignore
      }
    }

    addToast({ title: 'Prompt Published!', message: `"${data.title}" is now live in the gallery.`, type: 'success' });
    return newPrompt;
  };

  const updatePrompt = async (id: string, updates: Partial<Prompt>) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    await adminUpdatePromptInDb(id, updates);
    addToast({ title: 'Prompt Updated', message: 'Changes saved to Supabase.', type: 'success' });
  };

  const deletePrompt = async (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    await adminDeletePromptInDb(id);
    addToast({ title: 'Prompt Deleted', type: 'info' });
  };

  const incrementCopies = (id: string) => {
    const target = prompts.find((p) => p.id === id);
    if (!target) return;

    const newCopies = (target.copies || 0) + 1;

    // Optimistic UI increment
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, copies: newCopies } : p))
    );

    setRecentCopies((prev) => [
      { id, title: target.title, type: target.type, timestamp: Date.now() },
      ...prev.filter((r) => r.id !== id).slice(0, 19),
    ]);

    // Persist copies count to localStorage so refresh keeps the count
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

    // Record copy in Supabase
    recordPromptCopyInDb(id, currentUser?.id);
  };

  const recordView = (id: string) => {
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
  };

  // Skills operations
  const getSkillById = (id: string) => {
    return skills.find((s) => s.id === id);
  };

  const addSkill = (data: Omit<Skill, 'id' | 'created_at' | 'installs'>) => {
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
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast({ title: 'Skill Updated', type: 'success' });
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    addToast({ title: 'Skill Deleted', type: 'info' });
  };

  const incrementInstalls = (id: string) => {
    const target = skills.find((s) => s.id === id);
    if (!target) return;
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, installs: s.installs + 1 } : s))
    );
    setRecentCopies((prev) => [
      { id, title: target.title, type: 'skill', timestamp: Date.now() },
      ...prev.filter((r) => r.id !== id).slice(0, 19),
    ]);
  };

  // Favorite toggle (Works for both logged-in users and guests, completely persistent across refreshes)
  const toggleFavorite = async (id: string): Promise<boolean> => {
    const exists = favorites.includes(id);
    const nextFavorites = exists ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(nextFavorites);

    // Save to localStorage immediately so refresh preserves favorites
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aicorn_favorites', JSON.stringify(nextFavorites));
      } catch {}
    }

    // Update prompt favorites count optimistically & persist in stats
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newFavCount = Math.max(0, (p.favorites || 0) + (exists ? -1 : 1));
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

    if (exists) {
      addToast({ title: 'Removed from Favorites', type: 'info' });
      if (currentUser?.id) {
        toggleFavoriteInDb(id, currentUser.id).catch(() => {});
      }
      return false;
    } else {
      addToast({ title: 'Saved to Favorites', type: 'success' });
      if (currentUser?.id) {
        toggleFavoriteInDb(id, currentUser.id).catch(() => {});
      }
      return true;
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  // Pro Upgrade Modal opener
  const openUpgradeModal = (context: { reason: 'pro_prompt' | 'skill'; itemTitle?: string }) => {
    setUpgradeModalContext(context);
    setUpgradeModalOpen(true);
  };

  // Home Featured Prompts handler
  const setHomeFeatured = (featured: { imagePromptId?: string; videoPromptId?: string; skillId?: string }) => {
    setHomeFeaturedState(featured);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aicorn_home_featured', JSON.stringify(featured));
      } catch {}
    }
    addToast({ title: 'Homepage Featured Updated', message: 'Homepage Explore cards updated with selected media.', type: 'success' });
  };

  // Dynamic Blog & Social Posts handlers
  const addBlogPostItem = (item: Omit<BlogPostItem, 'id' | 'date'>) => {
    const newItem: BlogPostItem = {
      ...item,
      id: `post-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    const updated = [newItem, ...blogPosts];
    setBlogPosts(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aicorn_blog_posts', JSON.stringify(updated));
      } catch {}
    }
    addToast({ title: 'Update Published!', message: `"${item.title}" added to posts.`, type: 'success' });
  };

  const deleteBlogPostItem = (id: string) => {
    const updated = blogPosts.filter((p) => p.id !== id);
    setBlogPosts(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aicorn_blog_posts', JSON.stringify(updated));
      } catch {}
    }
    addToast({ title: 'Post Deleted', type: 'info' });
  };

  // Submissions (Supabase + Local)
  const addSubmission = async (data: Omit<UserSubmission, 'id' | 'created_at' | 'status'>): Promise<Prompt> => {
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

    // Automatically publish to live gallery so user sees it right away
    const livePrompt = await addPrompt({
      title: data.title,
      type: (data.type === 'skill' ? 'image' : data.type) as 'image' | 'video',
      prompt: data.prompt,
      description: data.description,
      category: data.category,
      subcategory: 'Community',
      model: data.model,
      style: data.style || 'Photorealistic',
      aspect_ratio: (data.aspect_ratio as any) || '16:9',
      preview_url: data.preview_url,
      video_url: data.type === 'video' ? (data.preview_url || undefined) : undefined,
      tags: data.tags,
      author: {
        name: currentUser?.name || 'Creator',
        handle: currentUser?.handle || '@creator',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      rating: 5.0,
      is_pro: false,
      is_featured: false,
      is_trending: true,
    });

    return livePrompt;
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );

    await updateSubmissionStatusInDb(id, status);

    // If approved, push to live prompts
    if (status === 'approved' && target.type !== 'skill') {
      await addPrompt({
        title: target.title,
        type: target.type as 'image' | 'video',
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
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
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
  };

  // Clerk Auth Triggers
  const login = () => {
    openSignIn();
  };

  const loginWithGoogle = () => {
    openSignIn();
  };

  const signUp = () => {
    openSignUp();
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Clerk sign out warning:', e);
    }
    setCurrentUser(null);
    addToast({ title: 'Signed Out', message: 'You are now browsing as guest.', type: 'info' });
  };

  return (
    <AppContext.Provider
      value={{
        prompts,
        isLoadingPrompts,
        getPromptById,
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
      }}
    >
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
