import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { Cookie, Shield, CheckCircle2, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy — AICORN',
  description: 'Understand how AICORN uses cookies, local storage, and third-party embeds to provide a fast, secure visual prompt gallery.',
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A867D] mb-6">
          <Link href="/" className="hover:text-[#101010] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#101010] font-bold">Cookie Policy</span>
        </div>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-[#E8E4DA]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E4DA] text-xs font-black uppercase tracking-wider text-[#101010] mb-3 shadow-xs">
            <Cookie className="w-3.5 h-3.5 text-[#FF4B26]" />
            <span>TRANSPARENCY & COOKIES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium">
            Last updated: March 2026. How AICORN uses cookies, tokens, and storage technologies.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[#1A1A1A] space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">1. What Are Cookies?</h2>
            <p className="text-[#1A1A1A]/85">
              Cookies and local browser storage are small text files or key-value entries placed on your device when you browse websites. They help websites remember your preferences, keep you securely authenticated, and enhance application performance without re-prompting for credentials.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">2. Types of Cookies We Use</h2>
            
            <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[#101010] font-bold text-base">
                <Shield className="w-4 h-4 text-[#D8F651]" />
                <span>Strictly Necessary & Authentication Cookies</span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A867D]">
                These cookies are essential for you to navigate AICORN and use its features, such as logging into your account via Clerk Auth, verifying admin credentials, and maintaining secure sessions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[#101010] font-bold text-base">
                <Settings className="w-4 h-4 text-[#FF4B26]" />
                <span>Preferences & Local State</span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A867D]">
                We use localStorage to remember your saved favorite prompts, recently copied prompt history, and cookie consent preferences so you don&apos;t have to set them each time you visit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[#101010] font-bold text-base">
                <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                <span>Performance & Aggregated Analytics</span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A867D]">
                Anonymous telemetry measures which prompts are copied most frequently and tracks general page views in Supabase so our trending algorithms can showcase the best generative assets.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">3. Third-Party Embeds and Services</h2>
            <p className="text-[#1A1A1A]/85">
              Some prompts showcase video clips hosted on Google Drive or YouTube, and images hosted on Supabase Storage. These external services may use their own cookies when you interact with embedded players according to their independent privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">4. How You Can Control Cookies</h2>
            <p className="text-[#1A1A1A]/85">
              You can adjust your cookie settings at any time in your browser settings (Chrome, Safari, Firefox, Edge). Note that disabling necessary authentication cookies may prevent you from saving prompts or signing in.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[#E8E4DA]">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">5. Questions & Contact</h2>
            <p className="text-[#1A1A1A]/85">
              For any questions regarding our Cookie Policy, please reach out to us at{' '}
              <a href="mailto:curators@aicorn.design" className="font-bold underline text-[#101010]">
                curators@aicorn.design
              </a>{' '}
              or connect with founder Pawan Suda on{' '}
              <a href="https://x.com/Pawan0Suda" target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#101010]">
                X (@Pawan0Suda)
              </a>.
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
