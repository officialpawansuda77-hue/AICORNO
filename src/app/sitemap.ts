import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/data/categoriesModels';
import { BLOG_POSTS } from '@/data/blogData';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';
import { OPUS_5_5_VIDEOS } from '@/data/opusVideosData';
import { SKILLS_DATA } from '@/data/skillsData';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aicorn.co.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/prompts/image',
    '/prompts/video',
    '/ai-videos',
    '/ai-videos/opus-5-5',
    '/ai-videos/launch',
    '/skills',
    '/categories',
    '/blog',
    '/pricing',
    '/privacy',
    '/terms',
    '/cookie-policy',
    '/refund-policy',
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1.0 : path.startsWith('/prompts') || path.startsWith('/ai-videos') ? 0.9 : 0.7,
    })),
    ...CATEGORIES.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...[...IMAGE_PROMPTS, ...VIDEO_PROMPTS, ...OPUS_5_5_VIDEOS].map((prompt) => ({
      url: `${siteUrl}/prompts/${prompt.id}`,
      lastModified: new Date(prompt.created_at || '2026-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...SKILLS_DATA.map((skill) => ({
      url: `${siteUrl}/skills/${skill.id}`,
      lastModified: new Date(skill.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
