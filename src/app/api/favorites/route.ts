import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// POST /api/favorites -> Toggle favorite in Supabase
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { promptId } = await req.json();
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Check if favorite exists
    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .maybeSingle();

    if (existing) {
      // Remove
      await supabaseAdmin.from('favorites').delete().eq('id', existing.id);
      return NextResponse.json({ success: true, favorited: false });
    } else {
      // Add
      await supabaseAdmin.from('favorites').insert({
        user_id: userId,
        prompt_id: promptId,
      });
      return NextResponse.json({ success: true, favorited: true });
    }
  } catch (error: any) {
    console.error('Error in favorites API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update favorite' },
      { status: 500 }
    );
  }
}

// GET /api/favorites -> Get user favorites from Supabase
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: favorites, error } = await supabaseAdmin
      .from('favorites')
      .select('prompt_id')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      favorites: favorites.map((f: any) => f.prompt_id),
    });
  } catch (error: any) {
    console.error('Error fetching favorites API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
