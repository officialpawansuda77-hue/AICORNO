import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import ProvidersWrapper from "./ProvidersWrapper";
import { ClerkProvider } from '@clerk/nextjs';

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aicorn.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    template: '%s — AICORN',
  },
  description:
    'Discover high-quality AI image prompts, cinematic video prompts and autonomous agent skills. Preview verified generations, copy cinematic camera prompts, and start creating.',
  applicationName: 'AICORN',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'AICORN',
    title: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    description: 'Curated AI image prompts, video prompts, and autonomous agent skills for creative professionals.',
    url: siteUrl,
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    description: 'Curated AI image prompts, video prompts, and autonomous agent skills for creators.',
    images: ['/opengraph-image'],
  },
  keywords: [
    "AI prompts",
    "AI video prompts",
    "AI image prompts",
    "agent skills",
    "Veo 3",
    "Midjourney v6",
    "OpenAI Sora",
    "Kling AI",
    "Seedance",
    "Flux.1 Pro",
    "Claude Code skills",
    "Manus agent skills",
    "prompt engineering gallery",
  ],
  authors: [{ name: "Pawan Suda", url: siteUrl }],
  creator: "Pawan Suda",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: siteUrl,
  },
};

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        'url': siteUrl,
        'name': 'AICORN',
        'description': 'Curated AI image prompts, video prompts, and autonomous agent skills for creators.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${siteUrl}/prompts/image?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        'name': 'AICORN',
        'url': siteUrl,
        'logo': `${siteUrl}/logo.svg`,
      },
    ],
  };

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={`${nunito.variable} scroll-smooth`}>
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#1A1A1A] font-sans antialiased selection:bg-[#D8F651] selection:text-[#101010]">
          <ProvidersWrapper>{children}</ProvidersWrapper>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
