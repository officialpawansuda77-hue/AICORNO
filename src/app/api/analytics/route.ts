import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// POST /api/analytics -> Supabase prompt_views and prompt_copies
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, promptId, userId, sessionId } = body;

    if (!event || !promptId) {
      return NextResponse.json({ error: 'event and promptId are required' }, { status: 400 });
    }

    if (event === 'view') {
      await supabaseAdmin.from('prompt_views').insert({
        prompt_id: promptId,
        user_id: userId || null,
        session_id: sessionId || 'web-session',
      });
      return NextResponse.json({ success: true, event: 'view' });
    }

    if (event === 'copy') {
      await supabaseAdmin.from('prompt_copies').insert({
        prompt_id: promptId,
        user_id: userId || null,
      });
      return NextResponse.json({ success: true, event: 'copy' });
    }

    return NextResponse.json({ error: 'Unsupported analytics event' }, { status: 400 });
  } catch (error: any) {
    console.error('Error recording analytics in Supabase:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record analytics' },
      { status: 500 }
    );
  }
}
