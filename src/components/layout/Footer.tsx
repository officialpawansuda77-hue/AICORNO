import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#101010] text-white border-t border-black/10 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D8F651] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 12V18" stroke="#101010" strokeWidth="4" strokeLinecap="round" />
                  <path d="M19 22C19 20 20.8 18 23 18H41C43.2 18 45 20 45 22V23C45 23.6 44.6 24 44 24H20C19.4 24 19 23.6 19 23V22Z" fill="#101010" />
                  <path d="M20 26C20 26 20.5 44 32 48C43.5 44 44 26 44 26H20Z" fill="#FF4B26" />
                  <circle cx="32" cy="34" r="2.5" fill="#FFFFFF" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                AICORN
              </span>
            </Link>

            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Discover high-quality AI image prompts, video prompts, and agent skills. Preview the result, copy what works, and build the impossible.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#D8F651] animate-pulse"></span>
                Curated daily for creators and AI builders
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#D8F651]">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/prompts/image" className="hover:text-white transition-colors">
                  Image Prompts
                </Link>
              </li>
              <li>
                <Link href="/prompts/video" className="hover:text-white transition-colors">
                  Video Prompts
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-white transition-colors">
                  AI Agent Skills
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#D8F651]">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Prompting Guides
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">
                  Submit a Prompt
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition-colors">
                  My Saved Prompts
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#D8F651]">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/blog/keep-your-creations-free-of-ai-slop" className="hover:text-white transition-colors">
                  Manifesto
                </Link>
              </li>
              <li>
                <a href="mailto:curators@aicorn.design" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>

            {/* Social profiles */}
            <div className="pt-2">
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-white/50 mb-2">
                Connect
              </h5>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/Pawan0Suda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D8F651] hover:text-[#101010] text-white flex items-center justify-center transition-all text-xs font-black"
                  aria-label="Follow Pawan Suda on X"
                >
                  X
                </a>
                <a
                  href="https://www.instagram.com/mr_pawansuda_?stkn=MTcybXluN2JjajdvNA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D8F651] hover:text-[#101010] text-white flex items-center justify-center transition-all text-xs font-black"
                  aria-label="Follow Pawan Suda on Instagram"
                >
                  IG
                </a>
                <a
                  href="https://www.linkedin.com/in/pawan-suda-046923374?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D8F651] hover:text-[#101010] text-white flex items-center justify-center transition-all text-xs font-black"
                  aria-label="Connect with Pawan Suda on LinkedIn"
                >
                  IN
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 AICORN. Founded by Pawan Suda. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/Pawan0Suda" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              @Pawan0Suda
            </a>
            <span>&bull;</span>
            <span className="text-[#D8F651] font-semibold">Zero AI Slop Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
