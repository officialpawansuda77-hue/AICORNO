import { supabase, supabaseAdmin } from './supabase';

/**
 * Supabase Storage Buckets for AICORN Media
 * Supabase Storage is the SINGLE and ONLY media storage provider for the platform.
 */
export const STORAGE_BUCKETS = {
  IMAGES: 'prompt-images',
  VIDEOS: 'prompt-videos',
  THUMBNAILS: 'prompt-thumbnails',
  SUBMISSIONS: 'user-submissions',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface UploadResult {
  publicUrl: string;
  path: string;
  bucket: string;
  fullPath: string;
  storage: 'Supabase Storage';
}

/**
 * Sanitizes file names to ensure URL-safe storage paths in Supabase Storage.
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Upload a media asset (image/video/thumbnail) to a Supabase Storage bucket.
 * Uses client-side supabase client or server-side supabaseAdmin depending on caller.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob | Buffer,
  bucket: StorageBucket,
  options?: {
    categoryFolder?: string;
    userId?: string;
    customFileName?: string;
    contentType?: string;
    useAdminClient?: boolean;
  }
): Promise<UploadResult> {
  const client = options?.useAdminClient ? supabaseAdmin : supabase;

  // Build organized directory structure
  let folder = '';
  if (bucket === STORAGE_BUCKETS.SUBMISSIONS && options?.userId) {
    folder = `${options.userId}/`;
  } else if (options?.categoryFolder) {
    folder = `${options.categoryFolder.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`;
  }

  const rawName = options?.customFileName || (file instanceof File ? file.name : `asset-${Date.now()}`);
  const safeName = sanitizeFileName(rawName);
  const path = `${folder}${Date.now()}-${safeName}`;

  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType || (file instanceof File ? file.type : 'application/octet-stream'),
      upsert: true,
      cacheControl: '31536000',
    });

  if (error) {
    throw new Error(`Supabase Storage upload error [${bucket}]: ${error.message}`);
  }

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
    bucket,
    fullPath: `${bucket}/${data.path}`,
    storage: 'Supabase Storage',
  };
}

/**
 * Remove an asset from a Supabase Storage bucket.
 */
export async function deleteFromSupabaseStorage(
  bucket: StorageBucket,
  paths: string[],
  useAdminClient = false
): Promise<void> {
  const client = useAdminClient ? supabaseAdmin : supabase;
  const { error } = await client.storage.from(bucket).remove(paths);
  if (error) {
    console.warn(`Supabase Storage removal warning:`, error.message);
  }
}

/**
 * Get public URL for any asset in Supabase Storage.
 */
export function getPublicStorageUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
