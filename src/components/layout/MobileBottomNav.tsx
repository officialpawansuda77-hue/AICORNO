'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image as ImageIcon, Bot, Sparkles, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser, openUpgradeModal, isLoadingAuth } = useAppStore();

  const isPro = currentUser?.role === 'admin' || currentUser?.is_pro || currentUser?.membership === 'pro';

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-[#E8E4DA] lg:hidden shadow-lg select-none"
    >
      <div className="grid grid-cols-5 h-15 items-center px-1 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/' ? 'text-[#101010] font-black' : 'text-[#8A867D] hover:text-[#101010]'
          }`}
        >
          <div className={`p-1 rounded-full ${pathname === '/' ? 'bg-[#D8F651]/60' : ''}`}>
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* 2. Prompts */}
        <Link
          href="/prompts/image"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname.startsWith('/prompts') ? 'text-[#101010] font-black' : 'text-[#8A867D] hover:text-[#101010]'
          }`}
        >
          <div className={`p-1 rounded-full ${pathname.startsWith('/prompts') ? 'bg-[#D8F651]/60' : ''}`}>
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Prompts</span>
        </Link>

        {/* 3. Skills */}
        <Link
          href="/skills"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname.startsWith('/skills') ? 'text-[#101010] font-black' : 'text-[#8A867D] hover:text-[#101010]'
          }`}
        >
          <div className={`p-1 rounded-full ${pathname.startsWith('/skills') ? 'bg-[#D8F651]/60' : ''}`}>
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Skills</span>
        </Link>

        {/* 4. Pricing */}
        <Link
          href="/pricing"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            pathname === '/pricing' ? 'text-[#101010] font-black' : 'text-[#8A867D] hover:text-[#101010]'
          }`}
        >
          <div className={`p-1 rounded-full ${pathname === '/pricing' ? 'bg-[#D8F651]/60' : ''}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
            Pricing
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B26]"></span>
          </span>
        </Link>

        {/* 5. Account / Sign In */}
        {currentUser ? (
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname.startsWith('/dashboard') ? 'text-[#101010] font-black' : 'text-[#8A867D] hover:text-[#101010]'
            }`}
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#101010]"
              />
              {isPro && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D8F651] rounded-full border border-[#101010]"></span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 truncate max-w-[54px]">
              {currentUser.name.split(' ')[0]}
            </span>
          </Link>
        ) : isLoadingAuth ? (
          <div className="flex flex-col items-center justify-center py-1 text-[#8A867D] animate-pulse">
            <div className="w-5 h-5 rounded-full bg-black/10" />
            <span className="text-[10px] mt-0.5">...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openUpgradeModal({ reason: 'signin' })}
            className="flex flex-col items-center justify-center py-1 text-[#101010] font-black transition-transform active:scale-95"
          >
            <div className="p-1 rounded-full bg-[#101010] text-[#D8F651]">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 text-[#101010] font-extrabold">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
