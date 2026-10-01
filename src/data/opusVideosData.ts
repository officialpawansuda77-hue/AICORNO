import { Prompt } from '@/types';

export interface OpusVideoItem extends Prompt {
  subcategory: 'Motion graphics' | 'Explainers' | '3D scenes' | 'Games';
  handle: string;
  duration: string;
  remake_url?: string;
}

// Demo seed videos removed at owner request (2026-10-01).
// This section now serves only user-uploaded videos from Supabase.
export const OPUS_5_5_VIDEOS: OpusVideoItem[] = [];
