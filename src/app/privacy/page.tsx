'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A867D] mb-6">
          <Link href="/" className="hover:text-[#101010]">Home</Link>
          <span>/</span>
          <span className="text-[#101010] font-bold">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-[#E8E4DA]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E4DA] text-xs font-black uppercase tracking-wider text-[#101010] mb-3 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-[#D8F651] fill-[#D8F651]" />
            <span>LEGAL & TRANSPARENCY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium">
            Last updated: March 2026. How AICORN protects your data, prompts, and identity.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[#1A1A1A] space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">1. Introduction</h2>
            <p className="text-[#1A1A1A]/85">
              Welcome to AICORN (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, store, and safeguard your information when you visit our platform, browse our curated AI prompts, save favorites, or submit original creative skills.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">2. Information We Collect</h2>
            <p className="text-[#1A1A1A]/85">
              We collect minimal information necessary to deliver our high-speed discovery services:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0"></span>
                <span><strong>Account Information:</strong> When you sign up via Clerk Authentication, we receive your email address, display name, and avatar image.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0"></span>
                <span><strong>Usage & Interaction Data:</strong> We record prompt copy events, favorites, and view counts to power trending curation algorithms in our Supabase database.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0"></span>
                <span><strong>User Submissions:</strong> Any prompts, skills, parameters, or media assets you submit for community curation.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">3. How We Use Your Data</h2>
            <p className="text-[#1A1A1A]/85">
              We never sell your personal information or training data to third parties. We use your data exclusively to:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0"></span>
                <span>Synchronize your saved favorites and collections across devices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0"></span>
                <span>Review and publish approved community prompt submissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0"></span>
                <span>Analyze platform performance and eradicate low-fidelity AI artifacts.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">4. Data Storage & Security</h2>
            <p className="text-[#1A1A1A]/85">
              Your authentication is secured by enterprise-grade Clerk infrastructure. Database records and prompt assets are encrypted and maintained with PostgreSQL Row Level Security (RLS) on Supabase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">5. Contact Us</h2>
            <p className="text-[#1A1A1A]/85">
              If you have any questions or data deletion requests, contact our privacy team at{' '}
              <a href="mailto:privacy@aicorn.design" className="font-bold underline text-[#101010] hover:text-[#FF4B26]">
                privacy@aicorn.design
              </a>.
            </p>
          </section>
        </div>

      </div>
    </AppLayout>
  );
}
