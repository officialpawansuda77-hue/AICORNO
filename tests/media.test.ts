import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractGoogleDriveId,
  extractYouTubeId,
  isDirectVideoUrl,
  parseMediaUrl,
} from '../src/lib/mediaUtils';

test('extractGoogleDriveId correctly extracts IDs from multiple share formats', () => {
  const url1 = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing';
  assert.equal(extractGoogleDriveId(url1), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

  const url2 = 'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  assert.equal(extractGoogleDriveId(url2), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

  const url3 = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview';
  assert.equal(extractGoogleDriveId(url3), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
});

test('parseMediaUrl builds embedUrl and thumbnailUrl for Google Drive', () => {
  const gdriveUrl = 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j_k-lmnop/view?usp=sharing';
  const parsed = parseMediaUrl(gdriveUrl);

  assert.ok(parsed.isGoogleDrive);
  assert.equal(parsed.googleDriveId, '1a2b3c4d5e6f7g8h9i0j_k-lmnop');
  assert.equal(parsed.embedUrl, 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j_k-lmnop/preview');
  assert.equal(parsed.thumbnailUrl, 'https://drive.google.com/thumbnail?id=1a2b3c4d5e6f7g8h9i0j_k-lmnop&sz=w1200');
});

test('parseMediaUrl recognizes YouTube links', () => {
  const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const parsed = parseMediaUrl(ytUrl);

  assert.ok(parsed.isYouTube);
  assert.equal(parsed.youtubeId, 'dQw4w9WgXcQ');
  assert.equal(parsed.embedUrl, 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
  assert.equal(parsed.thumbnailUrl, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
});

test('isDirectVideoUrl recognizes mp4, webm and mov files', () => {
  assert.ok(isDirectVideoUrl('https://example.com/videos/cinematic.mp4'));
  assert.ok(isDirectVideoUrl('https://example.com/asset.webm?token=123'));
  assert.ok(isDirectVideoUrl('https://assets.mixkit.co/videos/preview/car.mp4'));
  assert.equal(isDirectVideoUrl('https://example.com/photo.jpg'), false);
});
