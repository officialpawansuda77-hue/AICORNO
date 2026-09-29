import { NextRequest, NextResponse } from 'next/server';
import { uploadMediaToR2, isR2Configured } from '@/lib/r2';

export const runtime = 'nodejs';

// POST /api/upload -> Cloudflare R2 Media Upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mediaType = (formData.get('type') as string) || 'images';

    if (!file) {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let folder: 'images' | 'videos' | 'thumbnails' = 'images';
    if (mediaType === 'video' || file.type.startsWith('video/')) {
      folder = 'videos';
    } else if (mediaType === 'thumbnail') {
      folder = 'thumbnails';
    }

    const result = await uploadMediaToR2(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      folder
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: result.size,
      mimeType: result.mimeType,
      storage: 'Cloudflare R2',
      isLiveConfigured: isR2Configured,
    });
  } catch (error: any) {
    console.error('Error uploading media to Cloudflare R2:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media to Cloudflare R2.' },
      { status: 500 }
    );
  }
}
