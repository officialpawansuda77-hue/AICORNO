import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CANONICAL_CATEGORIES,
  normalizeCategoryName,
  isCategoryMatch,
  getCategorySlug,
} from '../src/lib/categories';
import { IMAGE_PROMPTS } from '../src/data/imagePrompts';
import { VIDEO_PROMPTS } from '../src/data/videoPrompts';
import { SKILLS_DATA } from '../src/data/skillsData';

test('normalizeCategoryName handles Anime and variations', () => {
  assert.equal(normalizeCategoryName('anime'), 'Anime & Illustration');
  assert.equal(normalizeCategoryName('Anime'), 'Anime & Illustration');
  assert.equal(normalizeCategoryName('Anime & Illustration'), 'Anime & Illustration');
  assert.equal(normalizeCategoryName('anime-illustration'), 'Anime & Illustration');
});

test('isCategoryMatch matches slug and full name for Anime', () => {
  assert.ok(isCategoryMatch('Anime & Illustration', 'anime'));
  assert.ok(isCategoryMatch('anime', 'Anime & Illustration'));
  assert.ok(isCategoryMatch('Anime & Illustration', 'Anime'));
  assert.ok(isCategoryMatch('Anime', 'anime'));
});

test('normalizeCategoryName handles Automotive and Cinematic variations', () => {
  assert.equal(normalizeCategoryName('automotive'), 'Automotive');
  assert.equal(normalizeCategoryName('cinematic'), 'Cinematic & Film');
  assert.ok(isCategoryMatch('Automotive', 'automotive'));
  assert.ok(isCategoryMatch('Cinematic & Film', 'cinematic'));
});

test('all 16 canonical categories exist and have valid slugs', () => {
  assert.equal(CANONICAL_CATEGORIES.length, 16);
  for (const cat of CANONICAL_CATEGORIES) {
    const slug = getCategorySlug(cat);
    assert.ok(slug.length > 0);
    assert.ok(isCategoryMatch(cat, slug));
  }
});
