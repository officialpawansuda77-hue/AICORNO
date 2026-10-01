import { Prompt } from '@/types';

// Demo seed catalog removed at owner request (2026-10-01).
// The public catalog now serves only user-uploaded prompts from Supabase.
const ALL_VIDEO_PROMPTS: Prompt[] = [];

// Only published prompts belong in the public catalog. This prevents draft
// examples from appearing as real inventory or inflating catalog counts.
export const VIDEO_PROMPTS = ALL_VIDEO_PROMPTS.filter((prompt) =>
  /^(vid-[1-4]|vid-6|vid-7)$/.test(prompt.id)
);
