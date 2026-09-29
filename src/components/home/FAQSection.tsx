'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  linkText?: string;
  linkUrl?: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'What makes AICORN prompts different from standard AI prompts?',
    answer:
      'Every prompt in AICORN is engineered with verified cinematographic parameters: precise Kelvin color temperature, camera sensor and focal length values, realistic optical lighting caustics, and aspect ratio constraints. We eliminate vague descriptors like "hyperrealistic 8k masterpiece" and deliver prompts that yield consistent, commercial-grade results across Midjourney, ChatGPT, Flux.1 Pro, and video engines like Veo 3.',
  },
  {
    question: 'How do I use these prompts in Midjourney, ChatGPT, or Kling?',
    answer:
      'Simply browse the catalog, preview the exact visual output, and click the "Copy" button. For image generators like ChatGPT (DALL-E 3) or Midjourney, paste the prompt directly into your prompt input box. For video models like Kling 1.5, Veo 3, or Runway Gen-3, the camera movement and lighting instructions will translate directly into smooth physics and motion.',
  },
  {
    question: 'How does video hosting with Google Drive work on AICORN?',
    answer:
      'To provide infinite video showcase capability without Supabase storage quota limits, AICORN lets creators paste Google Drive share links. Our platform automatically extracts the video ID, generates instant fluid embed players, and provides instant video playback with zero upload limits.',
  },
  {
    question: 'Can I use prompts and generated media for commercial projects?',
    answer:
      'Yes. All prompts published on AICORN can be used to generate visuals for commercial client projects, social media campaigns, print, brand identity, and film pre-visualization without attribution.',
  },
  {
    question: 'Can I submit my own AI prompts or agent skills?',
    answer:
      'Absolutely! Click "Submit" in the navigation bar to share your prompts or autonomous agent instruction skills. Once published, your creations appear live across the platform with creator attribution.',
    linkText: 'Submit a Prompt',
    linkUrl: '/submit',
  },
  {
    question: 'What is the refund policy for AICORN Pro subscriptions?',
    answer:
      'We offer an unconditional 14-day money-back guarantee on all new AICORN Pro subscriptions. If you are not completely satisfied with our curated prompts, simply contact curators@aicorn.design for a prompt full refund.',
    linkText: 'Read Refund Policy',
    linkUrl: '/refund-policy',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F7F4EE] border-t border-[#E8E4DA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E4DA] text-xs font-black uppercase tracking-wider text-[#101010] mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF4B26]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            Everything you need to know.
          </h2>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium max-w-xl mx-auto">
            Got questions about prompt engineering, video embeds, commercial rights, or subscriptions? We&apos;ve got answers.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl sm:rounded-3xl bg-white border border-[#E8E4DA] overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between gap-4 text-left font-black text-sm sm:text-base text-[#101010] hover:text-[#FF4B26] transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#F7F4EE] flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#101010] text-[#D8F651]' : 'text-[#8A867D]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#8A867D] leading-relaxed border-t border-[#F2EFE8]">
                    <p className="mb-2">{faq.answer}</p>
                    {faq.linkText && faq.linkUrl && (
                      <Link
                        href={faq.linkUrl}
                        className="inline-flex items-center gap-1.5 font-bold text-xs text-[#101010] hover:text-[#FF4B26] mt-2 underline"
                      >
                        <span>{faq.linkText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#101010] text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">Have a specific question?</h3>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              Reach out directly to our curation team or connect with founder Pawan Suda.
            </p>
          </div>
          <a
            href="mailto:curators@aicorn.design"
            className="pill-btn px-6 py-3 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] text-xs font-black rounded-full shrink-0 shadow-sm"
          >
            Contact Support
          </a>
        </div>

      </div>
    </section>
  );
}
