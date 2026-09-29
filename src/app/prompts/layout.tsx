import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Prompts',
  description: 'Browse curated AI image and video prompts with verified previews, camera direction, and model metadata.',
};

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
