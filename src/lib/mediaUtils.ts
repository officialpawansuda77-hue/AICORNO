/**
 * Media Utilities for AICORN
 * Handles Google Drive video embedding, YouTube embedding, direct videos, and thumbnails.
 */

export interface ParsedMedia {
  originalUrl: string;
  isGoogleDrive: boolean;
  isYouTube: boolean;
  isDirectVideo: boolean;
  googleDriveId?: string;
  youtubeId?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  directStreamUrl?: string;
}

/**
 * Extracts Google Drive file ID from various sharing formats:
 * - https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D5E...
 * - https://drive.google.com/uc?id=1A2B3C4D5E...
 * - https://drive.google.com/file/d/1A2B3C4D5E...
 */
export function extractGoogleDriveId(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // Match /file/d/{id} or /d/{id}
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/i) || url.match(/\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Match ?id={id} or &id={id}
  const idQueryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
  if (idQueryMatch && idQueryMatch[1]) {
    return idQueryMatch[1];
  }

  // If the user pasted just the raw file ID (usually ~28-44 chars alphanumeric)
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Extracts YouTube video ID from standard or shortened URLs
 */
export function extractYouTubeId(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Checks if a URL points to a direct video file (mp4, webm, mov, etc.)
 */
export function isDirectVideoUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const clean = rawUrl.trim().toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogg') ||
    clean.includes('assets.mixkit.co') ||
    clean.includes('prompt-videos') ||
    clean.includes('/videos/') ||
    clean.includes('/uploads/') && (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov')) ||
    clean.startsWith('blob:')
  );
}

/**
 * Parses any video or media URL into standardized embed and preview formats.
 */
export function parseMediaUrl(rawUrl?: string | null): ParsedMedia {
  const url = (rawUrl || '').trim();

  // 1. Google Drive
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return {
      originalUrl: url,
      isGoogleDrive: true,
      isYouTube: false,
      isDirectVideo: false,
      googleDriveId: driveId,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
      directStreamUrl: `https://drive.google.com/uc?export=download&id=${driveId}`,
    };
  }

  // 2. YouTube
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      originalUrl: url,
      isGoogleDrive: false,
      isYouTube: true,
      isDirectVideo: false,
      youtubeId: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    };
  }

  // 3. Direct Video
  const isDirect = isDirectVideoUrl(url);
  return {
    originalUrl: url,
    isGoogleDrive: false,
    isYouTube: false,
    isDirectVideo: isDirect,
    embedUrl: url || undefined,
    thumbnailUrl: undefined,
    directStreamUrl: url || undefined,
  };
}
