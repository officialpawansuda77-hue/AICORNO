import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { fetchPromptsFromDb } from '@/lib/supabaseService';
import { isEmailAdmin } from '@/lib/authUtils';

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
    const sort = (searchParams.get('sort') as any) || 'popular';
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

// POST /api/prompts -> Supabase PostgreSQL Prompt Creation
export async function POST(req: NextRequest) {
  try {
    // Verify user with Clerk Auth
    const { userId } = await auth();
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;

    // Authenticated users can publish prompts to the gallery
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

    const { data: newPrompt, error: insertError } = await supabaseAdmin
      .from('prompts')
      .insert({
        title: body.title,
        description: body.description,
        prompt: body.prompt,
        type: body.type || 'image',
        category_id: categoryId,
        model_id: modelId,
        style: body.style || null,
        aspect_ratio: body.aspect_ratio || '16:9',
        duration: body.duration || null,
        camera: body.camera || null,
        lighting: body.lighting || null,
        image_url: body.image_url || body.preview_url || null,
        video_url: body.video_url || null,
        thumbnail_url: body.thumbnail_url || body.preview_url || null,
        status: body.status || 'published',
        featured: Boolean(body.featured),
        trending: Boolean(body.trending),
        created_by: userId || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, prompt: newPrompt });
  } catch (error: any) {
    console.error('Error creating prompt in Supabase:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
