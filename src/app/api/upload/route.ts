import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, STORAGE_BUCKETS, StorageBucket } from '@/lib/supabaseStorage';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

function inferContentType(fileName: string, providedType?: string): string {
  if (providedType && providedType !== 'application/octet-stream') {
    return providedType;
  }
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    default:
      return providedType || 'image/jpeg';
  }
}

// POST /api/upload -> Supabase Storage Media Upload with Local Fallback
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mediaType = (formData.get('type') as string) || 'image';
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
    }

    const contentType = inferContentType(file.name, file.type);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine target bucket accurately:
    // If the file is an image, it MUST go to prompt-images or user-submissions, NEVER prompt-videos!
    let bucket: StorageBucket = STORAGE_BUCKETS.IMAGES;
    const isActualVideo = contentType.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);

    if (isActualVideo) {
      bucket = STORAGE_BUCKETS.VIDEOS;
    } else if (mediaType === 'submission') {
      bucket = STORAGE_BUCKETS.SUBMISSIONS;
    } else {
      bucket = STORAGE_BUCKETS.IMAGES;
    }

    try {
      const result = await uploadToSupabaseStorage(buffer, bucket, {
        categoryFolder: category,
        customFileName: file.name,
        contentType,
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
    } catch (storageErr: any) {
      console.warn('Supabase storage upload failed, saving to local fallback:', storageErr?.message);

      // Local fallback to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const safeName = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeName}`,
        bucket: 'local-fallback',
        path: `/uploads/${safeName}`,
        size: file.size,
        storage: 'Local Fallback',
      });
    }
  } catch (error: any) {
    console.error('Error handling upload request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process media upload.' },
      { status: 500 }
    );
  }
}
