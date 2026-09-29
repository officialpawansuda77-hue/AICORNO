import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/data/categoriesModels';
import { BLOG_POSTS } from '@/data/blogData';
import { IMAGE_PROMPTS } from '@/data/imagePrompts';
import { VIDEO_PROMPTS } from '@/data/videoPrompts';
import { SKILLS_DATA } from '@/data/skillsData';

const siteUrl = 'https://aicorn-ai.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/prompts/image',
    '/prompts/video',
    '/skills',
    '/categories',
    '/blog',
    '/pricing',
    '/privacy',
    '/terms',
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : 0.7,
    })),
    ...CATEGORIES.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...[...IMAGE_PROMPTS, ...VIDEO_PROMPTS].map((prompt) => ({
      url: `${siteUrl}/prompts/${prompt.id}`,
      lastModified: new Date(prompt.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...SKILLS_DATA.map((skill) => ({
      url: `${siteUrl}/skills/${skill.id}`,
      lastModified: new Date(skill.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
