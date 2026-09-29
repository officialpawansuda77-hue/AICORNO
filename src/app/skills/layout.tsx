import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agent Skills',
  description: 'Discover production-tested instruction packs for research, development, design, marketing, and automation.',
  alternates: { canonical: '/skills' },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
