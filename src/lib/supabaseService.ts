import { supabase, supabaseAdmin } from './supabase';
import { Prompt, Category, AIModel, UserSubmission } from '@/types';
import { CATEGORIES as FALLBACK_CATEGORIES, AI_MODELS as FALLBACK_MODELS } from '@/data/categoriesModels';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';
import { normalizeCategoryName, isCategoryMatch } from './categories';

// In-memory view deduplication set
const viewedPromptSessions = new Set<string>();

export interface FetchPromptsParams {
  type?: 'image' | 'video';
  category?: string;
  subcategory?: string;
  model?: string;
  style?: string;
  aspectRatio?: string;
  duration?: string;
  price?: 'free' | 'pro';
  sort?: 'popular' | 'copies' | 'latest' | 'trending' | 'favorited';
  search?: string;
  page?: number;
  limit?: number;
}

export interface FetchPromptsResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  totalPages: number;
}

// Static records contain the verified preview assets. When Supabase has a
// record with the same title, keep its counters and id but use the canonical
// local media and metadata so a stale DB thumbnail can never misrepresent a
// prompt (for example, the Porsche or Ghibli previews).
const CANONICAL_PROMPTS = [...IMAGE_PROMPTS, ...VIDEO_PROMPTS];

// Helper to map DB row to frontend UI Prompt model
export function mapDbPromptToUI(row: any): Prompt {
  const rawCategory = row.category?.name || row.category_name || row.category || 'Automotive';
  const categoryName = normalizeCategoryName(rawCategory);
  const subcategoryName = row.subcategory?.name || row.subcategory || 'General';
  const modelName = row.model?.name || row.model_name || row.model || 'ChatGPT';
  const type = (row.type as 'image' | 'video') || 'image';

  const tags: string[] = [];
  if (Array.isArray(row.prompt_tags)) {
    row.prompt_tags.forEach((pt: any) => {
      if (pt.tag?.name) tags.push(pt.tag.name);
    });
  } else if (Array.isArray(row.tags)) {
    tags.push(...row.tags);
  }

  const previewUrl = row.image_url || row.thumbnail_url || row.preview_url || '';
  const thumbnails = [row.image_url || row.preview_url, row.thumbnail_url].filter(Boolean);

  return {
    id: row.id,
    title: row.title || 'Untitled Prompt',
    type,
    prompt: row.prompt || '',
    description: row.description || '',
    category: categoryName,
    subcategory: subcategoryName,
    model: modelName,
    style: row.style || 'Photorealistic',
    aspect_ratio: row.aspect_ratio || '16:9',
    duration: row.duration || (type === 'video' ? '8s' : undefined),
    camera: row.camera || 'Cinematic tracking shot',
    lighting: row.lighting || 'Studio lighting',
    lens: row.lens || '50mm Prime f/1.8',
    composition: row.composition || 'Rule of thirds',
    mood: row.mood || 'Editorial & Prestigious',
    preview_url: previewUrl,
    video_url: row.video_url || undefined,
    thumbnails: thumbnails.length > 0 ? thumbnails : [previewUrl],
    tags: tags.length > 0 ? tags : ['ai', 'creative'],
    author: {
      name: row.author_name || 'AICORN Studio',
      handle: row.author_handle || '@aicorn_curator',
      avatar: row.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
    copies: row.copies_count ?? row.copies ?? 0,
    favorites: row.favorites_count ?? row.favorites ?? 0,
    views: row.views_count ?? row.views ?? 0,
    rating: 5.0,
    is_pro: row.is_pro ?? false,
    is_featured: Boolean(row.featured ?? row.is_featured ?? true),
    is_trending: Boolean(row.trending ?? row.is_trending ?? true),
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

// 1. FETCH PROMPTS (With DB-level filtering, search, pagination, and fallback)
export async function fetchPromptsFromDb(params: FetchPromptsParams = {}): Promise<FetchPromptsResponse> {
  const {
    type,
    category,
    subcategory,
    model,
    style,
    aspectRatio,
    duration,
    price,
    sort = 'latest',
    search,
    page = 1,
    limit = 24,
  } = params;

  const from = (page - 1) * limit;

  try {
    let query = supabase
      .from('prompts')
      .select(
        `
        *,
        category:categories(id, name, slug),
        subcategory:subcategories(id, name, slug),
        model:models(id, name, slug),
        prompt_tags(tag:tags(id, name, slug))
      `,
        { count: 'exact' }
      )
      .eq('status', 'published');

    // Type filter
    if (type) {
      query = query.eq('type', type);
    }

    // Aspect ratio filter
    if (aspectRatio) {
      query = query.eq('aspect_ratio', aspectRatio);
    }

    // Duration filter
    if (duration) {
      query = query.eq('duration', duration);
    }

    // Style filter
    if (style) {
      query = query.ilike('style', `%${style}%`);
    }

    // Sorting - default to newest first so user's uploads are always visible at top
    if (sort === 'copies') {
      query = query.order('copies_count', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'trending') {
      query = query.order('copies_count', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'favorited') {
      query = query.order('favorites_count', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'popular') {
      query = query.order('views_count', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase prompts query error:', error.message);
      return { prompts: [], total: 0, page: 1, totalPages: 1 };
    }

    if (data) {
      const dbPrompts = data.map(mapDbPromptToUI);
      let filteredResults = dbPrompts;

      // Type filter
      if (type) {
        filteredResults = filteredResults.filter((p) => p.type === type);
      }

      // Robust category matching
      if (category) {
        filteredResults = filteredResults.filter((p) => isCategoryMatch(p.category, category));
      }

      // Model filter
      if (model) {
        filteredResults = filteredResults.filter(
          (p) => p.model.toLowerCase().includes(model.toLowerCase()) || model.toLowerCase().includes(p.model.toLowerCase())
        );
      }

      // Style filter
      if (style) {
        filteredResults = filteredResults.filter((p) => p.style.toLowerCase().includes(style.toLowerCase()));
      }

      // Aspect ratio
      if (aspectRatio) {
        filteredResults = filteredResults.filter((p) => p.aspect_ratio === aspectRatio);
      }

      // Duration
      if (duration) {
        filteredResults = filteredResults.filter((p) => p.duration === duration);
      }

      // Subcategory
      if (subcategory) {
        const sub = subcategory.toLowerCase();
        filteredResults = filteredResults.filter((p) =>
          p.subcategory.toLowerCase().includes(sub) || sub.includes(p.subcategory.toLowerCase())
        );
      }

      // Price
      if (price) {
        if (price === 'pro') filteredResults = filteredResults.filter((p) => p.is_pro);
        if (price === 'free') filteredResults = filteredResults.filter((p) => !p.is_pro);
      }

      // Search
      if (search) {
        const s = search.toLowerCase();
        filteredResults = filteredResults.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.prompt.toLowerCase().includes(s) ||
            p.category.toLowerCase().includes(s) ||
            p.tags.some((t) => t.toLowerCase().includes(s))
        );
      }

      // Sorting
      if (sort === 'copies') {
        filteredResults.sort((a, b) => b.copies - a.copies);
      } else if (sort === 'latest') {
        filteredResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sort === 'trending') {
        // Trending filter: only show trending prompts, sorted by copies (desc)
        filteredResults = filteredResults.filter(p => p.is_trending);
        filteredResults.sort((a, b) => b.copies - a.copies);
      } else if (sort === 'favorited') {
        filteredResults.sort((a, b) => b.favorites - a.favorites);
      } else {
        filteredResults.sort((a, b) => b.views - a.views);
      }

      const paged = filteredResults.slice(from, from + limit);

      return {
        prompts: paged,
        total: filteredResults.length,
        page,
        totalPages: Math.max(1, Math.ceil(filteredResults.length / limit)),
      };
    }

    // If table returned empty array or 0 records, fallback to sample prompts
    return fallbackFilterPrompts(params);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Supabase error';
    console.warn('Supabase network error, using local fallback:', message);
    return fallbackFilterPrompts(params);
  }
}

// Fallback filtering over local seed dataset
function fallbackFilterPrompts(params: FetchPromptsParams): FetchPromptsResponse {
  const allPrompts = [...IMAGE_PROMPTS, ...VIDEO_PROMPTS];
  let filtered = allPrompts;

  if (params.type) {
    filtered = filtered.filter((p) => p.type === params.type);
  }
  if (params.category) {
    filtered = filtered.filter((p) => isCategoryMatch(p.category, params.category!));
  }
  if (params.model) {
    const model = params.model.toLowerCase();
    filtered = filtered.filter(
      (p) => p.model.toLowerCase().includes(model) || model.includes(p.model.toLowerCase())
    );
  }
  if (params.style) {
    filtered = filtered.filter((p) => p.style.toLowerCase().includes(params.style!.toLowerCase()));
  }
  if (params.aspectRatio) {
    filtered = filtered.filter((p) => p.aspect_ratio === params.aspectRatio);
  }
  if (params.duration) {
    filtered = filtered.filter((p) => p.duration === params.duration);
  }
  if (params.subcategory) {
    const sub = params.subcategory.toLowerCase();
    filtered = filtered.filter((p) =>
      p.subcategory.toLowerCase().includes(sub) || sub.includes(p.subcategory.toLowerCase())
    );
  }
  if (params.price) {
    if (params.price === 'pro') filtered = filtered.filter((p) => p.is_pro);
    if (params.price === 'free') filtered = filtered.filter((p) => !p.is_pro);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort
  if (params.sort === 'copies') {
    filtered.sort((a, b) => b.copies - a.copies);
  } else if (params.sort === 'latest') {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (params.sort === 'trending') {
    filtered.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0));
  } else if (params.sort === 'favorited') {
    filtered.sort((a, b) => b.favorites - a.favorites);
  } else {
    filtered.sort((a, b) => b.views - a.views);
  }

  const page = params.page || 1;
  const limit = params.limit || 24;
  const from = (page - 1) * limit;
  const paged = filtered.slice(from, from + limit);

  return {
    prompts: paged,
    total: filtered.length,
    page,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

// 2. FETCH SINGLE PROMPT BY ID (Instant local resolution for img-* and vid-*)
export async function fetchPromptByIdFromDb(id: string): Promise<Prompt | undefined> {
  const allPrompts = [...IMAGE_PROMPTS, ...VIDEO_PROMPTS];
  // 1. Instant match in memory (0ms latency for img-10, img-2, etc.)
  const localMatch = allPrompts.find((p) => p.id === id);
  if (localMatch) {
    return localMatch;
  }

  // 2. Query Supabase if id is a valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(
          `
          *,
          category:categories(id, name, slug),
          subcategory:subcategories(id, name, slug),
          model:models(id, name, slug),
          prompt_tags(tag:tags(id, name, slug))
        `
        )
        .eq('id', id)
        .single();

      if (!error && data) {
        return mapDbPromptToUI(data);
      }
    } catch (e) {
      // fallback
    }
  }

  return undefined;
}

// 3. RECORD PROMPT COPY (Increments copies_count and inserts into prompt_copies)
export async function recordPromptCopyInDb(promptId: string, userId?: string | null): Promise<void> {
  try {
    // Insert into prompt_copies
    await supabase.from('prompt_copies').insert({
      prompt_id: promptId,
      user_id: userId || null,
    });

    // Increment copies_count
    try {
      const { error: rpcErr } = await supabase.rpc('increment_copies', { p_id: promptId });
      if (rpcErr) {
        // Direct update fallback if RPC is not installed
        const { data } = await supabase.from('prompts').select('copies_count').eq('id', promptId).single();
        if (data) {
          await supabase
            .from('prompts')
            .update({ copies_count: (data.copies_count || 0) + 1 })
            .eq('id', promptId);
        }
      }
    } catch {
      // Ignore if fallback fails
    }
  } catch (err) {
    // Do not block UI if analytics fails
    console.warn('Copy event record error:', err);
  }
}

// 4. RECORD PROMPT VIEW (With deduplication)
export async function recordPromptViewInDb(
  promptId: string,
  userId?: string | null,
  sessionId?: string
): Promise<void> {
  const sessionKey = `${sessionId || 'anon'}_${promptId}`;
  if (viewedPromptSessions.has(sessionKey)) {
    return; // Deduplicate rapid refreshes
  }
  viewedPromptSessions.add(sessionKey);

  try {
    await supabase.from('prompt_views').insert({
      prompt_id: promptId,
      user_id: userId || null,
      session_id: sessionId || 'web-session',
    });

    // Increment views_count
    const { data } = await supabase.from('prompts').select('views_count').eq('id', promptId).single();
    if (data) {
      await supabase
        .from('prompts')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', promptId);
    }
  } catch (err) {
    // Silent fail
  }
}

// 5. TOGGLE FAVORITE IN SUPABASE
export async function toggleFavoriteInDb(
  promptId: string,
  userId: string
): Promise<{ isFavorited: boolean }> {
  try {
    // Check if favorite exists
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .single();

    if (existing) {
      // Delete favorite
      await supabase.from('favorites').delete().eq('id', existing.id);
      return { isFavorited: false };
    } else {
      // Insert favorite
      await supabase.from('favorites').insert({
        user_id: userId,
        prompt_id: promptId,
      });
      return { isFavorited: true };
    }
  } catch (err) {
    console.error('Favorite toggle DB error:', err);
    return { isFavorited: true };
  }
}

// 6. FETCH USER FAVORITES FROM SUPABASE
export async function fetchUserFavoritesFromDb(userId: string): Promise<Prompt[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(
        `
        prompt:prompts(
          *,
          category:categories(name, slug),
          model:models(name, slug)
        )
      `
      )
      .eq('user_id', userId);

    if (!error && data) {
      return data.filter((row: any) => row.prompt).map((row: any) => mapDbPromptToUI(row.prompt));
    }
  } catch (err) {
    // fallback
  }
  return [];
}

// 7. FETCH CATEGORIES (From Supabase with fallback)
export async function fetchCategoriesFromDb(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('prompt_count', { ascending: false });

    if (!error && data && data.length > 0) {
      const fallbackBySlug = new Map(FALLBACK_CATEGORIES.map((category) => [category.slug, category]));
      return data.map((c) => {
        const fallback = fallbackBySlug.get(c.slug);
        return {
          slug: c.slug,
          name: normalizeCategoryName(c.name || c.slug),
          description: c.description || fallback?.description || '',
          icon: fallback?.icon || 'Folder',
          bg_color: fallback?.bg_color || '#F4ECE1',
          prompt_count: CANONICAL_PROMPTS.filter((prompt) =>
            isCategoryMatch(prompt.category, c.name || c.slug)
          ).length,
          skill_count: fallback?.skill_count || 0,
          // Prefer the canonical in-repo artwork. Legacy DB covers include a
          // figurine for anime and a white car for automotive, both of which
          // contradict the prompt being previewed.
          featured_image: fallback?.featured_image || c.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        };
      });
    }
  } catch (e) {
    // fallback below
  }
  return FALLBACK_CATEGORIES;
}

// 8. FETCH AI MODELS (From Supabase with fallback)
export async function fetchModelsFromDb(): Promise<AIModel[]> {
  try {
    const { data, error } = await supabase.from('models').select('*').order('prompt_count', { ascending: false });

    if (!error && data && data.length > 0) {
      const mergedList: AIModel[] = data.map((m) => {
        const fallback = FALLBACK_MODELS.find(
          (fm) => fm.name.toLowerCase() === String(m.name || '').toLowerCase() || fm.id === m.slug
        );
        const nameLower = String(m.name || '').toLowerCase();
        const isVideo = fallback
          ? fallback.type === 'video'
          : /kling|veo|runway|sora|luma|hailuo|seedance|pika|video/.test(nameLower);

        const matchingPrompts = CANONICAL_PROMPTS.filter(
          (prompt) => prompt.model.toLowerCase() === nameLower
        );

        return {
          id: m.slug || fallback?.id || nameLower.replace(/[^a-z0-9]/g, '-'),
          name: m.name,
          type: isVideo ? 'video' : 'image',
          badge: fallback?.badge || 'AICORN Verified',
          description: m.description || fallback?.description || '',
          prompt_count: Math.max(m.prompt_count || 0, matchingPrompts.length, fallback?.prompt_count || 0),
        };
      });

      // Ensure all fallback models (such as ChatGPT) are present
      for (const fb of FALLBACK_MODELS) {
        if (!mergedList.some((m) => m.name.toLowerCase() === fb.name.toLowerCase())) {
          mergedList.push(fb);
        }
      }

      return mergedList;
    }
  } catch (e) {
    // fallback
  }
  return FALLBACK_MODELS;
}

// 9. SUBMISSIONS MANAGEMENT
export async function submitPromptToDb(submission: Omit<UserSubmission, 'id' | 'created_at' | 'status'>, userId?: string): Promise<UserSubmission> {
  const newSub: UserSubmission = {
    ...submission,
    id: `sub-${Date.now()}`,
    submitted_by: userId || 'community@aicorn.design',
    status: 'pending',
    created_at: new Date().toISOString().split('T')[0],
  };

  try {
    const { data, error } = await supabase.from('submissions').insert({
      user_id: userId || null,
      title: submission.title,
      description: submission.description,
      prompt: submission.prompt,
      type: submission.type,
      image_url: submission.preview_url,
      video_url: submission.type === 'video' ? submission.preview_url : null,
      thumbnail_url: submission.preview_url,
      status: 'pending',
    }).select().single();

    if (!error && data) {
      return {
        id: data.id,
        title: data.title,
        type: data.type,
        description: data.description,
        prompt: data.prompt,
        category: submission.category,
        model: submission.model,
        style: submission.style,
        aspect_ratio: submission.aspect_ratio,
        preview_url: data.image_url || data.thumbnail_url,
        tags: submission.tags,
        submitted_by: data.user_id || 'community@aicorn.design',
        status: data.status,
        created_at: data.created_at.split('T')[0],
      };
    }
  } catch (err) {
    console.warn('Submission DB write error:', err);
  }

  return newSub;
}

export async function fetchSubmissionsFromDb(): Promise<UserSubmission[]> {
  try {
    const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((s) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        description: s.description || '',
        prompt: s.prompt,
        category: 'Community',
        model: 'Various',
        style: 'Modern',
        aspect_ratio: '16:9',
        preview_url: s.image_url || s.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        tags: ['community'],
        submitted_by: s.user_id || 'community@aicorn.design',
        status: s.status,
        created_at: s.created_at.split('T')[0],
      }));
    }
  } catch (e) {
    // fallback
  }
  return [];
}

export async function updateSubmissionStatusInDb(id: string, status: 'approved' | 'rejected', notes?: string) {
  try {
    await supabase.from('submissions').update({ status, admin_notes: notes || null }).eq('id', id);
  } catch (e) {
    console.error('Update submission error:', e);
  }
}

// 10. ADMIN PROMPT CRUD OPERATIONS IN SUPABASE
export async function adminCreatePromptInDb(data: any): Promise<Prompt | null> {
  try {
    const res = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.prompt) {
        return mapDbPromptToUI(json.prompt);
      }
    }
  } catch (e) {
    console.error('Admin create prompt error via /api/prompts:', e);
  }
  return null;
}

export async function adminUpdatePromptInDb(id: string, updates: Partial<Prompt>): Promise<boolean> {
  try {
    const res = await fetch('/api/prompts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    return res.ok;
  } catch (e) {
    console.error('Admin update prompt error:', e);
    return false;
  }
}

export async function adminDeletePromptInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/prompts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Admin delete prompt error:', e);
    return false;
  }
}
