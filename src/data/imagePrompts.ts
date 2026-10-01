import { Prompt } from '@/types';

// Demo seed catalog removed at owner request (2026-10-01).
// The public catalog now serves only user-uploaded prompts from Supabase.
const ALL_IMAGE_PROMPTS: Prompt[] = [];

// Keep the public catalog aligned with the published Supabase seed. The remaining
// draft examples stay in this file for reference but must not inflate the gallery.
export const IMAGE_PROMPTS = ALL_IMAGE_PROMPTS.filter((prompt) =>
  /^(img-[1-8]|img-10)$/.test(prompt.id)
);
