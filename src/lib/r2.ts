import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 is an S3-compatible object storage service used exclusively for media assets.
// It is NOT used for databases, authentication, sessions, or user data.

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'aicorn-media';
const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

export const isR2Configured = Boolean(
  accountId &&
  accessKeyId &&
  secretAccessKey &&
  accessKeyId !== 'your_r2_access_key_id'
);

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export interface UploadMediaResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

/**
 * Upload an image or video asset to Cloudflare R2 bucket.
 * Supabase stores the resulting public URL in PostgreSQL.
 */
export async function uploadMediaToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: 'images' | 'videos' | 'thumbnails' = 'images'
): Promise<UploadMediaResult> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${Date.now()}-${sanitizedName}`;

  if (!isR2Configured) {
    console.warn('[Cloudflare R2] Live credentials not detected in .env.local. Simulating media URL for development.');
    return {
      url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop`,
      key,
      size: fileBuffer.length,
      mimeType: contentType,
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await r2Client.send(command);

  const url = publicUrl
    ? `${publicUrl.replace(/\/$/, '')}/${key}`
    : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;

  return {
    url,
    key,
    size: fileBuffer.length,
    mimeType: contentType,
  };
}

/**
 * Delete a media object from Cloudflare R2
 */
export async function deleteMediaFromR2(key: string): Promise<boolean> {
  if (!isR2Configured) return true;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch (err) {
    console.error('[Cloudflare R2] Delete error:', err);
    return false;
  }
}
