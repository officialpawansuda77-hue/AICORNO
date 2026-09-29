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

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify admin role - strictly restricted to sudapawan301@gmail.com
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const isAuthorized = isEmailAdmin(userEmail) || profile?.role === 'admin';
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Administrator privileges strictly restricted' }, { status: 403 });
    }

    const body = await req.json();

    const { data: newPrompt, error: insertError } = await supabaseAdmin
      .from('prompts')
      .insert({
        title: body.title,
        description: body.description,
        prompt: body.prompt,
        type: body.type,
        category_id: body.category_id || null,
        model_id: body.model_id || null,
        style: body.style || null,
        aspect_ratio: body.aspect_ratio || '16:9',
        duration: body.duration || null,
        camera: body.camera || null,
        lighting: body.lighting || null,
        image_url: body.image_url || null,
        video_url: body.video_url || null,
        thumbnail_url: body.thumbnail_url || null,
        status: body.status || 'published',
        featured: Boolean(body.featured),
        trending: Boolean(body.trending),
        created_by: userId,
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
