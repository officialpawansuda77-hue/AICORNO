import { supabase, supabaseAdmin } from './supabase';
import { Prompt, Category, AIModel, UserSubmission } from '@/types';
import { CATEGORIES as FALLBACK_CATEGORIES, AI_MODELS as FALLBACK_MODELS } from '@/data/categoriesModels';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';

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

// Helper to map DB row to frontend UI Prompt model
export function mapDbPromptToUI(row: any): Prompt {
  const categoryName = row.category?.name || row.category_name || row.category || 'General';
  const subcategoryName = row.subcategory?.name || row.subcategory || 'General';
  const modelName = row.model?.name || row.model_name || row.model || 'Flux.1 Pro';

  // Extract tags from joined prompt_tags if available
  const tags: string[] = [];
  if (Array.isArray(row.prompt_tags)) {
    row.prompt_tags.forEach((pt: any) => {
      if (pt.tag?.name) tags.push(pt.tag.name);
    });
  } else if (Array.isArray(row.tags)) {
    tags.push(...row.tags);
  }

  return {
    id: row.id,
    title: row.title || 'Untitled Prompt',
    type: (row.type as 'image' | 'video') || 'image',
    prompt: row.prompt || '',
    description: row.description || '',
    category: categoryName,
    subcategory: subcategoryName,
    model: modelName,
    style: row.style || 'Photorealistic',
    aspect_ratio: row.aspect_ratio || '16:9',
    duration: row.duration || (row.type === 'video' ? '8s' : undefined),
    camera: row.camera || 'Cinematic tracking shot',
    lighting: row.lighting || 'Studio lighting',
    lens: row.lens || '50mm Prime f/1.8',
    composition: row.composition || 'Rule of thirds',
    mood: row.mood || 'Editorial & Prestigious',
    preview_url: row.image_url || row.thumbnail_url || row.preview_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    video_url: row.video_url || undefined,
    thumbnails: [
      row.image_url || row.preview_url,
      row.thumbnail_url,
    ].filter(Boolean),
    tags: tags.length > 0 ? tags : ['ai', 'creative'],
    author: {
      name: row.author_name || 'AICORN Studio',
      handle: row.author_handle || '@aicorn_curator',
      avatar: row.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
    copies: row.copies_count || row.copies || 0,
    favorites: row.favorites_count || row.favorites || 0,
    views: row.views_count || row.views || 0,
    rating: 5.0,
    is_pro: Boolean(row.is_pro),
    is_featured: Boolean(row.featured || row.is_featured),
    is_trending: Boolean(row.trending || row.is_trending),
    created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-03-01',
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
    sort = 'popular',
    search,
    page = 1,
    limit = 24,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

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

    // Search filter across title, prompt, description
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,prompt.ilike.%${search}%`
      );
    }

    // Sorting
    if (sort === 'copies') {
      query = query.order('copies_count', { ascending: false });
    } else if (sort === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'trending') {
      query = query.eq('trending', true).order('copies_count', { ascending: false });
    } else if (sort === 'favorited') {
      query = query.order('favorites_count', { ascending: false });
    } else {
      query = query.order('views_count', { ascending: false });
    }

    // Pagination
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('Supabase prompts query error, using local fallback:', error.message);
      return fallbackFilterPrompts(params);
    }

    if (data && data.length > 0) {
      let filteredResults = data.map(mapDbPromptToUI);

      // In-memory filter for joined category/model names if not filtered directly in query
      if (category) {
        filteredResults = filteredResults.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (model) {
        filteredResults = filteredResults.filter(
          (p) => p.model.toLowerCase() === model.toLowerCase()
        );
      }

      return {
        prompts: filteredResults,
        total: count || filteredResults.length,
        page,
        totalPages: Math.ceil((count || filteredResults.length) / limit),
      };
    }

    // If table returned empty array or 0 records, fallback to sample prompts
    return fallbackFilterPrompts(params);
  } catch (err: any) {
    console.warn('Supabase network error, using local fallback:', err.message);
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
    filtered = filtered.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params.model) {
    filtered = filtered.filter((p) => p.model.toLowerCase() === params.model!.toLowerCase());
  }
  if (params.style) {
    filtered = filtered.filter((p) => p.style.toLowerCase() === params.style!.toLowerCase());
  }
  if (params.aspectRatio) {
    filtered = filtered.filter((p) => p.aspect_ratio === params.aspectRatio);
  }
  if (params.duration) {
    filtered = filtered.filter((p) => p.duration === params.duration);
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
    totalPages: Math.ceil(filtered.length / limit),
  };
}

// 2. FETCH SINGLE PROMPT BY ID
export async function fetchPromptByIdFromDb(id: string): Promise<Prompt | undefined> {
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
    // fallback below
  }

  const allPrompts = [...IMAGE_PROMPTS, ...VIDEO_PROMPTS];
  return allPrompts.find((p) => p.id === id);
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
      return data.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description || '',
        icon: 'Folder',
        bg_color: '#F4ECE1',
        prompt_count: c.prompt_count || 0,
        skill_count: 2,
        featured_image: c.cover_image || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
      }));
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
      return data.map((m) => ({
        id: m.slug,
        name: m.name,
        type: 'multimodal',
        badge: 'AICORN Verified',
        description: m.description || '',
        prompt_count: m.prompt_count || 0,
      }));
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
    const { data: created, error } = await supabase.from('prompts').insert({
      title: data.title,
      type: data.type,
      prompt: data.prompt,
      description: data.description,
      style: data.style,
      aspect_ratio: data.aspect_ratio,
      duration: data.duration || null,
      camera: data.camera || null,
      lighting: data.lighting || null,
      image_url: data.preview_url,
      video_url: data.video_url || null,
      thumbnail_url: data.preview_url,
      status: 'published',
      featured: Boolean(data.is_featured),
      trending: Boolean(data.is_trending),
    }).select().single();

    if (!error && created) {
      return mapDbPromptToUI(created);
    }
  } catch (e) {
    console.error('Admin create prompt error:', e);
  }
  return null;
}

export async function adminUpdatePromptInDb(id: string, updates: Partial<Prompt>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.description) payload.description = updates.description;
    if (updates.prompt) payload.prompt = updates.prompt;
    if (updates.type) payload.type = updates.type;
    if (updates.style) payload.style = updates.style;
    if (updates.aspect_ratio) payload.aspect_ratio = updates.aspect_ratio;
    if (updates.duration) payload.duration = updates.duration;
    if (updates.camera) payload.camera = updates.camera;
    if (updates.lighting) payload.lighting = updates.lighting;
    if (updates.preview_url) {
      payload.image_url = updates.preview_url;
      payload.thumbnail_url = updates.preview_url;
    }
    if (updates.video_url) payload.video_url = updates.video_url;
    if (updates.is_featured !== undefined) payload.featured = updates.is_featured;
    if (updates.is_trending !== undefined) payload.trending = updates.is_trending;

    const { error } = await supabase.from('prompts').update(payload).eq('id', id);
    return !error;
  } catch (e) {
    console.error('Admin update prompt error:', e);
    return false;
  }
}

export async function adminDeletePromptInDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    return !error;
  } catch (e) {
    console.error('Admin delete prompt error:', e);
    return false;
  }
}
