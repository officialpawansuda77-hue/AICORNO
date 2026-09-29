import type { MetadataRoute } from 'next';

const siteUrl = 'https://aicorn-ai.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/favorites', '/submit', '/sign-in', '/sign-up', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
