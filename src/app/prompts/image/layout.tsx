import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Prompts',
  description: 'Browse curated AI image prompts with verified previews and model-specific direction.',
  alternates: { canonical: '/prompts/image' },
};

export default function ImagePromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
