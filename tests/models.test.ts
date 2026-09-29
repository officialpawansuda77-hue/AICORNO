import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AI_MODELS } from '../src/data/categoriesModels';

test('AI_MODELS contains ChatGPT as an image model', () => {
  const chatgpt = AI_MODELS.find((m) => m.name.toLowerCase() === 'chatgpt');
  assert.ok(chatgpt, 'ChatGPT model should exist in AI_MODELS');
  assert.strictEqual(chatgpt.type, 'image', 'ChatGPT must be categorized as an image model');
});

test('Filtering AI_MODELS by image returns only image models', () => {
  const imageModels = AI_MODELS.filter((m) => m.type !== 'video');
  const modelNames = imageModels.map((m) => m.name);

  assert.ok(modelNames.includes('ChatGPT'), 'Image models must include ChatGPT');
  assert.ok(modelNames.includes('Flux.1 Pro'), 'Image models must include Flux.1 Pro');
  assert.ok(modelNames.includes('Midjourney v6.1'), 'Image models must include Midjourney v6.1');

  // Must NOT include video models
  assert.ok(!modelNames.includes('Veo 3'), 'Image models must NOT contain Veo 3');
  assert.ok(!modelNames.includes('Kling 1.5'), 'Image models must NOT contain Kling 1.5');
  assert.ok(!modelNames.includes('OpenAI Sora'), 'Image models must NOT contain OpenAI Sora');
  assert.ok(!modelNames.includes('Runway Gen-3 Alpha'), 'Image models must NOT contain Runway Gen-3');
});

test('Filtering AI_MODELS by video returns only video models', () => {
  const videoModels = AI_MODELS.filter((m) => m.type === 'video');
  const modelNames = videoModels.map((m) => m.name);

  assert.ok(modelNames.includes('Veo 3'), 'Video models must include Veo 3');
  assert.ok(modelNames.includes('Kling 1.5'), 'Video models must include Kling 1.5');
  assert.ok(modelNames.includes('OpenAI Sora'), 'Video models must include OpenAI Sora');

  // Must NOT include image models
  assert.ok(!modelNames.includes('ChatGPT'), 'Video models must NOT contain ChatGPT');
  assert.ok(!modelNames.includes('Flux.1 Pro'), 'Video models must NOT contain Flux.1 Pro');
  assert.ok(!modelNames.includes('Midjourney v6.1'), 'Video models must NOT contain Midjourney v6.1');
});
