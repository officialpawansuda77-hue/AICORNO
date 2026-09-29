import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchPromptsFromDb } from '@/lib/supabaseService';

export const runtime = 'nodejs';

// GET /api/prompts -> Supabase PostgreSQL Prompts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') as 'image' | 'video' | 'all') || 'all';
    const category = searchParams.get('category') || undefined;
    const model = searchParams.get('model') || undefined;
    const style = searchParams.get('style') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = (searchParams.get('sort') as any) || 'latest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '24', 10);

    const result = await fetchPromptsFromDb({
      type: type === 'all' ? undefined : type,
      category,
      model,
      style,
      search,
      sort,
      page,
      limit: pageSize,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching prompts from Supabase:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts -> Supabase PostgreSQL Prompt Creation (Bypasses RLS with supabaseAdmin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let categoryId = body.category_id || null;
    if (!categoryId && body.category) {
      try {
        const { data: catData } = await supabaseAdmin
          .from('categories')
          .select('id')
          .ilike('name', `%${body.category}%`)
          .limit(1)
          .maybeSingle();
        if (catData) categoryId = catData.id;
      } catch {
        // fallback
      }
    }

    let modelId = body.model_id || null;
    if (!modelId && body.model) {
      try {
        const { data: modData } = await supabaseAdmin
          .from('models')
          .select('id')
          .ilike('name', `%${body.model}%`)
          .limit(1)
          .maybeSingle();
        if (modData) modelId = modData.id;
      } catch {
        // fallback
      }
    }

    let cameraVal = body.camera || null;
    if (body.author && (body.author.name || body.author.avatar)) {
      cameraVal = 'author:' + JSON.stringify({
        name: body.author.name,
        handle: body.author.handle,
        avatar: body.author.avatar,
        camera: body.camera || null,
      });
    }

    const isValidUUID = body.created_by && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.created_by);

    const { data: newPrompt, error: insertError } = await supabaseAdmin
      .from('prompts')
      .insert({
        title: body.title || 'Untitled Prompt',
        description: body.description || '',
        prompt: body.prompt || '',
        type: body.type || 'image',
        category_id: categoryId,
        model_id: modelId,
        style: body.style || 'Photorealistic',
        aspect_ratio: body.aspect_ratio || '16:9',
        duration: body.duration || null,
        camera: cameraVal,
        lighting: body.lighting || null,
        image_url: body.image_url || body.preview_url || null,
        video_url: body.video_url || null,
        thumbnail_url: body.thumbnail_url || body.preview_url || null,
        status: body.status || 'published',
        featured: Boolean(body.featured ?? body.is_featured ?? true),
        trending: Boolean(body.trending ?? body.is_trending ?? true),
        views_count: body.views_count ?? 1,
        copies_count: body.copies_count ?? 0,
        favorites_count: body.favorites_count ?? 0,
        created_by: isValidUUID ? body.created_by : null,
      })
      .select(`
        *,
        category:categories(id, name, slug),
        model:models(id, name, slug)
      `)
      .single();

    if (insertError) {
      console.error('Supabase admin insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true, prompt: newPrompt });
  } catch (error: any) {
    console.error('Error creating prompt in Supabase:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

// PATCH /api/prompts -> Update Prompt
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing prompt id' }, { status: 400 });
    }

    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.prompt !== undefined) payload.prompt = updates.prompt;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.style !== undefined) payload.style = updates.style;
    if (updates.aspect_ratio !== undefined) payload.aspect_ratio = updates.aspect_ratio;
    if (updates.duration !== undefined) payload.duration = updates.duration;
    if (updates.camera !== undefined) payload.camera = updates.camera;
    if (updates.lighting !== undefined) payload.lighting = updates.lighting;
    if (updates.preview_url !== undefined) {
      payload.image_url = updates.preview_url;
      payload.thumbnail_url = updates.preview_url;
    }
    if (updates.video_url !== undefined) payload.video_url = updates.video_url;
    if (updates.is_featured !== undefined) payload.featured = updates.is_featured;
    if (updates.is_trending !== undefined) payload.trending = updates.is_trending;

    const { data, error } = await supabaseAdmin
      .from('prompts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, prompt: data });
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update prompt' }, { status: 500 });
  }
}

// DELETE /api/prompts -> Delete Prompt
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing prompt id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('prompts').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete prompt' }, { status: 500 });
  }
}
