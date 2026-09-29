'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/nextjs';
import { useAppStore } from '@/lib/store';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useAppStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] rounded-[28px] border border-[#E8E4DA] shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8A867D] hover:text-[#1A1A1A] hover:bg-[#F7F4EE] transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#101010] text-[#D8F651] mb-3 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
            {mode === 'signin' ? 'Welcome back to AICORN' : 'Join AICORN Platform'}
          </h3>
          <p className="text-sm text-[#8A867D] mt-1 font-medium">
            Discover prompts, sync favorites in Supabase, and submit your skills.
          </p>
        </div>

        {/* Clerk Sign In / Sign Up Embedded Flow */}
        <div className="flex justify-center">
          {mode === 'signin' ? (
            <SignIn
              routing="hash"
              appearance={{
                variables: {
                  colorPrimary: '#101010',
                  borderRadius: '1rem',
                  fontFamily: 'var(--font-nunito)',
                },
                elements: {
                  card: 'shadow-none border-none p-0 bg-transparent w-full',
                  header: 'hidden',
                  footer: 'hidden',
                  formButtonPrimary: 'bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-bold rounded-full py-2.5',
                  socialButtonsBlockButton: 'rounded-2xl border-[#E8E4DA] hover:bg-[#F7F4EE]',
                  formFieldInput: 'rounded-2xl bg-[#F7F4EE] border-[#E8E4DA]',
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                variables: {
                  colorPrimary: '#101010',
                  borderRadius: '1rem',
                  fontFamily: 'var(--font-nunito)',
                },
                elements: {
                  card: 'shadow-none border-none p-0 bg-transparent w-full',
                  header: 'hidden',
                  footer: 'hidden',
                  formButtonPrimary: 'bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-bold rounded-full py-2.5',
                  socialButtonsBlockButton: 'rounded-2xl border-[#E8E4DA] hover:bg-[#F7F4EE]',
                  formFieldInput: 'rounded-2xl bg-[#F7F4EE] border-[#E8E4DA]',
                },
              }}
            />
          )}
        </div>

        {/* Mode Toggle Footer */}
        <div className="mt-4 pt-4 border-t border-[#E8E4DA]/60 text-center text-xs text-[#8A867D]">
          {mode === 'signin' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#1A1A1A] hover:underline"
              >
                Sign up with Clerk
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#1A1A1A] hover:underline"
              >
                Sign in with Clerk
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
