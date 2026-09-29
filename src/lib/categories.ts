import { CATEGORIES } from '@/data/categoriesModels';

/**
 * Normalizes any category string (e.g. 'anime', 'Fashion', 'UGC', 'ugc-tiktok')
 * into the canonical Title Case category name from CATEGORIES.
 */
export function normalizeCategoryName(raw?: string | null): string {
  if (!raw) return 'General';
  const clean = raw.trim().toLowerCase().replace(/-/g, ' ');

  // Exact slug or name match first, before substring rules
  const exact = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === clean || c.name.toLowerCase() === clean
  );
  if (exact) return exact.name;

  // Helper for whole-word matching against the normalized input
  const hasWord = (word: string) =>
    new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(clean);

  if (hasWord('anime') || hasWord('illustration') || hasWord('ghibli')) {
    return 'Anime & Illustration';
  }
  if (hasWord('fashion') || hasWord('editorial') || hasWord('couture')) {
    return 'Fashion & Editorial';
  }
  if (hasWord('ugc') || hasWord('tiktok')) {
    return 'UGC & TikTok';
  }
  if (hasWord('food') || hasWord('beverage') || hasWord('culinary') || hasWord('gastronomy')) {
    return 'Food & Beverage';
  }
  if (hasWord('cinema') || hasWord('film') || hasWord('movie')) {
    return 'Cinematic & Film';
  }
  if (hasWord('beauty') || hasWord('skin') || hasWord('cosmetic')) {
    return 'Beauty & Skincare';
  }
  if (hasWord('fitness') || hasWord('sport') || hasWord('athlete')) {
    return 'Fitness & Sports';
  }
  if (hasWord('travel') || hasWord('nature') || hasWord('landscape')) {
    return 'Travel & Nature';
  }
  if (hasWord('luxury') || hasWord('jewelry') || hasWord('watch') || hasWord('horology')) {
    return 'Luxury & Jewelry';
  }
  if (clean === '3d' || hasWord('3d') || hasWord('motion') || hasWord('render')) {
    return '3D & Motion';
  }
  if (hasWord('auto') || hasWord('car') || hasWord('supercar')) {
    return 'Automotive';
  }
  if (hasWord('product') || hasWord('commercial')) {
    return 'Product Ads';
  }
  if (hasWord('arch') || hasWord('villa') || hasWord('interior')) {
    return 'Architecture';
  }
  if (hasWord('estate') || hasWord('penthouse') || hasWord('realty')) {
    return 'Real Estate';
  }
  if (hasWord('social') || hasWord('media')) {
    return 'Social Media';
  }
  if (hasWord('e-comm') || hasWord('ecomm') || hasWord('ecommerce')) {
    return 'E-commerce';
  }

  return raw;
}

/**
 * Category comparator that canonicalizes legacy labels and then compares exact names.
 */
export function isCategoryMatch(promptCat?: string | null, filterCat?: string | null): boolean {
  if (!promptCat || !filterCat) return false;
  return normalizeCategoryName(promptCat).toLowerCase() === normalizeCategoryName(filterCat).toLowerCase();
}

export const CANONICAL_CATEGORIES = CATEGORIES.map((c) => c.name);

export function getCategorySlug(categoryName: string): string {
  const normalized = normalizeCategoryName(categoryName);
  const found = CATEGORIES.find(
    (c) => c.name.toLowerCase() === normalized.toLowerCase() || c.slug.toLowerCase() === normalized.toLowerCase()
  );
  return found ? found.slug : categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

