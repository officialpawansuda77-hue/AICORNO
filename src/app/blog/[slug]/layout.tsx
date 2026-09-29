import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/data/blogData';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  return {
    title: post?.title || 'Guide',
    description: post?.excerpt || 'Prompt engineering and AI workflow guidance from AICORN.',
    alternates: { canonical: `/blog/${slug}` },
    openGraph: post ? { images: [{ url: post.cover_image, alt: post.title }] } : undefined,
  };
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
