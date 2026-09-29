import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Explore curated AI prompts and agent skills by creative category.',
  alternates: { canonical: '/categories' },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
