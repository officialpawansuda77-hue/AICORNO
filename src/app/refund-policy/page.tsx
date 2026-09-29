import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { DollarSign, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy — AICORN',
  description: 'AICORN subscription and digital asset refund terms, 14-day customer guarantee, and cancellation guidelines.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A867D] mb-6">
          <Link href="/" className="hover:text-[#101010] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#101010] font-bold">Refund Policy</span>
        </div>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-[#E8E4DA]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E4DA] text-xs font-black uppercase tracking-wider text-[#101010] mb-3 shadow-xs">
            <DollarSign className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>PAYMENTS & ASSURANCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium">
            Clear, transparent, and fair billing terms for AICORN Pro members and creators.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[#1A1A1A] space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-[#1A1A1A]/85">
              We stand firmly behind the quality of our curated prompts and agent skills. If you upgrade to AICORN Pro and find that the prompts do not meet your production standards, you are eligible for a <strong>100% full refund within 14 days</strong> of your initial billing date — no questions asked.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">2. Subscription Cancellations</h2>
            <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[#101010] font-bold text-base">
                <RefreshCcw className="w-4 h-4 text-[#101010]" />
                <span>Cancel Anytime with One Click</span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A867D]">
                You can cancel your subscription at any time directly through your account dashboard or billing portal. Upon cancellation, you retain full Pro access until the conclusion of your current billing period, after which no further charges will occur.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">3. Refund Eligibility & Exceptions</h2>
            <p className="text-[#1A1A1A]/85">
              To keep our platform fair for all creators:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#D8F651] mt-0.5 shrink-0" />
                <span>First-time subscriptions are eligible for the 14-day refund window.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF4B26] mt-0.5 shrink-0" />
                <span>Accounts that have systematically bulk-downloaded or scraped the entire prompt catalog prior to requesting a refund may be reviewed to prevent platform abuse.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">4. How to Request a Refund</h2>
            <p className="text-[#1A1A1A]/85">
              Simply send an email to{' '}
              <a href="mailto:curators@aicorn.design" className="font-bold underline text-[#101010]">
                curators@aicorn.design
              </a>{' '}
              with your account email address and invoice reference. All verified refund requests are processed within 2 to 4 business days to your original payment method.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[#E8E4DA]">
            <h2 className="text-xl sm:text-2xl font-black text-[#101010]">5. Operator & Contact Information</h2>
            <p className="text-[#1A1A1A]/85">
              AICORN is operated by Pawan Suda. You can contact support at{' '}
              <a href="mailto:curators@aicorn.design" className="font-bold underline text-[#101010]">
                curators@aicorn.design
              </a>{' '}
              or via social channels on{' '}
              <a href="https://www.linkedin.com/in/pawan-suda-046923374" target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#101010]">
                LinkedIn
              </a>{' '}
              and{' '}
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
