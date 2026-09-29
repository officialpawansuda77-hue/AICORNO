import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { promptId, userId, sessionId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
    }

    // 1. Fetch current views_count
    const { data: promptRow } = await supabaseAdmin
      .from('prompts')
      .select('views_count')
      .eq('id', promptId)
      .maybeSingle();

    const newViews = ((promptRow?.views_count || 0) + 1);

    // 2. Increment views_count via supabaseAdmin (bypassing RLS)
    await supabaseAdmin
      .from('prompts')
      .update({ views_count: newViews })
      .eq('id', promptId);

    // 3. Try to record view event
    try {
      const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      await supabaseAdmin.from('prompt_views').insert({
        prompt_id: promptId,
        user_id: isUUID ? userId : null,
        session_id: sessionId || 'web-session',
      });
    } catch {
      // Ignore if prompt_views insert fails
    }

    return NextResponse.json({ success: true, views_count: newViews });
  } catch (error: any) {
    console.error('Error incrementing views in DB:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update view count' },
      { status: 500 }
    );
  }
}
