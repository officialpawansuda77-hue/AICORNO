import { CATEGORIES } from '@/data/categoriesModels';

/**
 * Normalizes any category string (e.g. 'anime', 'Fashion', 'UGC', 'ugc-tiktok')
 * into the canonical Title Case category name from CATEGORIES.
 */
export function normalizeCategoryName(raw?: string | null): string {
  if (!raw) return 'General';
  const clean = raw.trim().toLowerCase().replace(/-/g, ' ');

  if (clean.includes('anime') || clean.includes('illustration') || clean.includes('ghibli')) {
    return 'Anime & Illustration';
  }
  if (clean.includes('fashion') || clean.includes('editorial') || clean.includes('couture')) {
    return 'Fashion & Editorial';
  }
  if (clean.includes('ugc') || clean.includes('tiktok')) {
    return 'UGC & TikTok';
  }
  if (clean.includes('food') || clean.includes('beverage') || clean.includes('culinary') || clean.includes('gastronomy')) {
    return 'Food & Beverage';
  }
  if (clean.includes('cinema') || clean.includes('film') || clean.includes('movie')) {
    return 'Cinematic & Film';
  }
  if (clean.includes('beauty') || clean.includes('skin') || clean.includes('cosmetic')) {
    return 'Beauty & Skincare';
  }
  if (clean.includes('fitness') || clean.includes('sport') || clean.includes('athlete')) {
    return 'Fitness & Sports';
  }
  if (clean.includes('travel') || clean.includes('nature') || clean.includes('landscape')) {
    return 'Travel & Nature';
  }
  if (clean.includes('luxury') || clean.includes('jewelry') || clean.includes('watch') || clean.includes('horology')) {
    return 'Luxury & Jewelry';
  }
  if (clean === '3d' || clean.includes('3d') || clean.includes('motion') || clean.includes('render')) {
    return '3D & Motion';
  }
  if (clean.includes('auto') || clean.includes('car') || clean.includes('supercar')) {
    return 'Automotive';
  }
  if (clean.includes('product') || clean.includes('commercial')) {
    return 'Product Ads';
  }
  if (clean.includes('arch') || clean.includes('villa') || clean.includes('interior')) {
    return 'Architecture';
  }
  if (clean.includes('estate') || clean.includes('penthouse') || clean.includes('realty')) {
    return 'Real Estate';
  }
  if (clean.includes('social') || clean.includes('media')) {
    return 'Social Media';
  }
  if (clean.includes('e-comm') || clean.includes('ecomm') || clean.includes('ecommerce')) {
    return 'E-commerce';
  }

  // Check matching slug or exact name
  const found = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === clean || c.name.toLowerCase() === clean
  );
  return found ? found.name : raw;
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

