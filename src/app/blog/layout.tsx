import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides & Insights',
  description: 'Prompt engineering, camera direction, visual taste, and AI agent workflow guides from AICORN.',
  alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
