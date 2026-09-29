import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { promptId, userId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
    }

    // 1. Fetch current copies_count
    const { data: promptRow } = await supabaseAdmin
      .from('prompts')
      .select('copies_count')
      .eq('id', promptId)
      .maybeSingle();

    const newCopies = ((promptRow?.copies_count || 0) + 1);

    // 2. Increment copies_count via supabaseAdmin (bypassing RLS)
    await supabaseAdmin
      .from('prompts')
      .update({ copies_count: newCopies })
      .eq('id', promptId);

    // 3. Try to record individual copy event
    try {
      // Validate if userId is UUID, otherwise leave null for Clerk string IDs
      const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      await supabaseAdmin.from('prompt_copies').insert({
        prompt_id: promptId,
        user_id: isUUID ? userId : null,
      });
    } catch {
      // Ignore if prompt_copies insert fails
    }

    return NextResponse.json({ success: true, copies_count: newCopies });
  } catch (error: any) {
    console.error('Error incrementing copies in DB:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update copy count' },
      { status: 500 }
    );
  }
}
