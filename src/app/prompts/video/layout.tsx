import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Prompts',
  description: 'Browse cinematic AI video prompts for Veo, Kling, Sora, Runway, and more.',
  alternates: { canonical: '/prompts/video' },
};

export default function VideoPromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
