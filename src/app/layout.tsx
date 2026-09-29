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

export const metadata: Metadata = {
  metadataBase: new URL('https://aicorn-ai.vercel.app'),
  title: {
    default: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    template: '%s — AICORN',
  },
  description:
    'Discover high-quality AI image prompts, video prompts and agent skills. Preview the result, copy what works, and start creating.',
  openGraph: {
    type: 'website',
    siteName: 'AICORN',
    title: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    description: 'Curated AI image prompts, video prompts, and agent skills for creators.',
    url: 'https://aicorn-ai.vercel.app/',
    images: [{
      url: '/og-image.png',
      width: 1024,
      height: 1024,
      alt: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AICORN — Premium AI Prompt & Agent Skill Gallery',
    description: 'Curated AI image prompts, video prompts, and agent skills for creators.',
    images: ['/og-image.png'],
  },
  keywords: [
    "AI prompts",
    "image prompts",
    "video prompts",
    "agent skills",
    "Veo 3",
    "Midjourney",
    "Sora",
    "Kling",
    "Claude Code",
    "Flux",
  ],
  authors: [{ name: "AICORN Curators" }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: 'https://aicorn-ai.vercel.app',
  },
};

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={`${nunito.variable} scroll-smooth`}>
        <head>
          <link rel="icon" href="/favicon.png" type="image/png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
