import type { Metadata } from 'next';
import { CATEGORIES } from '@/data/categoriesModels';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((item) => item.slug === slug);
  const name = category?.name || 'Category';
  return {
    title: name,
    description: category?.description || `Curated AI prompts and agent skills for ${name}.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default function CategorySlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
