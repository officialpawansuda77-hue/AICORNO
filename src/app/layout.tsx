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
  title: "AICORN — Premium AI Prompt & Agent Skill Gallery",
  description:
    "Discover high-quality AI image prompts, video prompts and agent skills. Preview the result, copy what works, and start creating.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${nunito.variable} scroll-smooth`}>
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </head>
        <body className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#1A1A1A] font-sans antialiased selection:bg-[#D8F651] selection:text-[#101010]">
          <ProvidersWrapper>{children}</ProvidersWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
