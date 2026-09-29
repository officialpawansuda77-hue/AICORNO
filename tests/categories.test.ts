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

test('img-10 Ghibli prompt belongs to Anime & Illustration and has correct image', () => {
  const img10 = IMAGE_PROMPTS.find((p) => p.id === 'img-10');
  assert.ok(img10, 'img-10 must exist');
  assert.equal(img10.category, 'Anime & Illustration');
  assert.equal(img10.preview_url, '/images/ghibli-train-sunset.jpg');
  assert.ok(isCategoryMatch(img10.category, 'anime'));
  assert.match(img10.title, /Ghibli Style Mountain Train Station/i);
});

test('vid-1 description does not have duplicate "commercial"', () => {
  const vid1 = VIDEO_PROMPTS.find((p) => p.id === 'vid-1');
  assert.ok(vid1, 'vid-1 must exist');
  assert.doesNotMatch(vid1.description, /commercial automotive commercial/i);
  assert.match(vid1.description, /automotive commercial/i);
});

test('vid-4 model is Kling 1.5 and not Nano Banana', () => {
  const vid4 = VIDEO_PROMPTS.find((p) => p.id === 'vid-4');
  assert.ok(vid4, 'vid-4 must exist');
  assert.equal(vid4.model, 'Kling 1.5');
  assert.notEqual(vid4.model, 'Nano Banana');
});

test('AI YouTube Research agent has distinct category and output_type tags', () => {
  const ytSkill = SKILLS_DATA.find((s) => s.id === 'skill-1');
  assert.ok(ytSkill, 'skill-1 must exist');
  assert.notEqual(ytSkill.category.toLowerCase(), ytSkill.output_type.toLowerCase());
});

test('all 16 canonical categories exist and have valid slugs', () => {
  assert.equal(CANONICAL_CATEGORIES.length, 16);
  for (const cat of CANONICAL_CATEGORIES) {
    const slug = getCategorySlug(cat);
    assert.ok(slug.length > 0);
    assert.ok(isCategoryMatch(cat, slug));
  }
});
