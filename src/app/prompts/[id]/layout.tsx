import type { Metadata } from 'next';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';
import { OPUS_5_5_VIDEOS } from '@/data/opusVideosData';

const prompts = [...IMAGE_PROMPTS, ...VIDEO_PROMPTS, ...OPUS_5_5_VIDEOS];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const prompt = prompts.find((item) => item.id === id);
  return {
    title: prompt?.title || 'AI Prompt',
    description: prompt?.description || 'Curated AI prompt with a verified preview from AICORN.',
    alternates: { canonical: `/prompts/${id}` },
    openGraph: prompt ? { images: [{ url: prompt.preview_url, alt: prompt.title }] } : undefined,
  };
}

export default function PromptIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
