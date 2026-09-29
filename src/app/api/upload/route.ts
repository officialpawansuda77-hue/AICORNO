import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, STORAGE_BUCKETS, StorageBucket } from '@/lib/supabaseStorage';

export const runtime = 'nodejs';

// POST /api/upload -> Supabase Storage Media Upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mediaType = (formData.get('type') as string) || 'image';
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let bucket: StorageBucket = STORAGE_BUCKETS.IMAGES;
    if (mediaType === 'video' || file.type.startsWith('video/')) {
      bucket = STORAGE_BUCKETS.VIDEOS;
    } else if (mediaType === 'submission') {
      bucket = STORAGE_BUCKETS.SUBMISSIONS;
    }

    const result = await uploadToSupabaseStorage(buffer, bucket, {
      categoryFolder: category,
      customFileName: file.name,
      contentType: file.type || 'application/octet-stream',
      useAdminClient: true,
    });

    return NextResponse.json({
      success: true,
      url: result.publicUrl,
      bucket: result.bucket,
      path: result.path,
      size: file.size,
      storage: 'Supabase Storage',
    });
  } catch (error: any) {
    console.error('Error uploading media to Supabase Storage:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media to Supabase Storage.' },
      { status: 500 }
    );
  }
}
