'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, UserCheck, HeartHandshake } from 'lucide-react';
import { useAppStore } from '@/lib/store';

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const ROLES = [
  { id: 'founder', label: 'Founder / Indie Hacker', icon: '🚀', desc: 'Building startups & AI products' },
  { id: 'developer', label: 'Developer / AI Engineer', icon: '💻', desc: 'Coding, scripts & CLI agent skills' },
  { id: 'artist', label: 'Designer / Digital Artist', icon: '🎨', desc: 'Visual image prompts & aesthetics' },
  { id: 'video_creator', label: 'Video Creator / Director', icon: '📹', desc: 'Cinematic AI videos & commercials' },
  { id: 'student', label: 'Student / Researcher', icon: '🎓', desc: 'Learning & experimenting with AI' },
  { id: 'agency', label: 'Agency / Marketer', icon: '💼', desc: 'Client campaigns & high conversion hooks' },
];

const SOURCES = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'twitter', label: 'X (Twitter)', icon: '🐦' },
  { id: 'youtube', label: 'YouTube', icon: '🔴' },
  { id: 'google', label: 'Google Search', icon: '🔍' },
  { id: 'friend', label: 'Friend / Community', icon: '👥' },
];

export default function OnboardingSurveyModal() {
  const { currentUser, addToast } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<string>('founder');
  const [selectedSource, setSelectedSource] = useState<string>('instagram');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const prevUserIdRef = useRef<string | undefined>(undefined);

  // Check if survey should be shown for the current user
  useEffect(() => {
    if (!currentUser) {
      setIsOpen(false);
      prevUserIdRef.current = undefined;
      return;
    }

    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== currentUser.id) {
      // User changed: close survey and reset UI state before checking the new user's flag
      setIsOpen(false);
      setStep(1);
      setSelectedRole('founder');
      setSelectedSource('instagram');
    }
    prevUserIdRef.current = currentUser.id;

    if (typeof window !== 'undefined') {
      const isCompleted = localStorage.getItem(`aicorn_survey_completed_${currentUser.id}`);
      if (!isCompleted) {
        // Short delay so page loads smoothly before showing welcome questionnaire
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser?.id]);

  // Accessible modal: focus trap, Escape dismiss, restore focus
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish('skipped');
        return;
      }
      if (e.key !== 'Tab') return;
      const last = focusable[focusable.length - 1] as HTMLElement;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleFinish = (action: 'completed' | 'skipped') => {
    if (typeof window !== 'undefined' && currentUser) {
      localStorage.setItem(`aicorn_survey_completed_${currentUser.id}`, 'true');
      if (action === 'completed') {
        localStorage.setItem(`aicorn_user_role_${currentUser.id}`, selectedRole);
        localStorage.setItem(`aicorn_user_source_${currentUser.id}`, selectedSource);
      }
    }

    setIsOpen(false);
    if (action === 'completed') {
      addToast({
        title: 'Profile Updated 🎉',
        message: 'Welcome to the AICORN creator community!',
        type: 'success',
      });
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-survey-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={() => handleFinish('skipped')}
    >
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DA] shadow-2xl p-6 sm:p-8 my-auto overflow-hidden text-[#101010]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D8F651] via-[#FF4B26] to-[#D8F651]" />

        {/* Accessible heading for screen readers */}
        <h2 id="onboarding-survey-heading" className="sr-only">Onboarding survey</h2>

        {/* Header bar with step indicator & Skip button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-[#101010]' : s < step ? 'w-4 bg-[#D8F651]' : 'w-4 bg-[#E8E4DA]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => handleFinish('skipped')}
            className="text-xs font-bold text-[#8A867D] hover:text-[#101010] px-2.5 py-1 rounded-full hover:bg-black/5 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* STEP 1: What describes you best? */}
        {step === 1 && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-[#D8F651]" />
                <span>STEP 1 OF 3</span>
              </div>
              <h3 className="text-2xl font-black text-[#101010] tracking-tight">
                What describes your role?
              </h3>
              <p className="text-xs text-[#8A867D] mt-1 font-medium">
                Helps us personalize prompt styles and agent skills for you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-white border-[#101010] shadow-sm ring-2 ring-[#101010]/10'
                        : 'bg-white/70 hover:bg-white border-[#E8E4DA] text-[#1A1A1A]'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#101010] truncate">{r.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#101010] shrink-0" />}
                      </div>
                      <p className="text-[10px] text-[#8A867D] mt-0.5 truncate">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="pill-btn w-full py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-[#D8F651]" />
            </button>
          </div>
        )}

        {/* STEP 2: How did you hear about AICORN? */}
        {step === 2 && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-[#D8F651]" />
                <span>STEP 2 OF 3</span>
              </div>
              <h3 className="text-2xl font-black text-[#101010] tracking-tight">
                Where did you hear about us?
              </h3>
              <p className="text-xs text-[#8A867D] mt-1 font-medium">
                We love knowing how creators discover the platform!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {SOURCES.map((s) => {
                const isSelected = selectedSource === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSource(s.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white border-[#101010] shadow-sm ring-2 ring-[#101010]/10'
                        : 'bg-white/70 hover:bg-white border-[#E8E4DA] text-[#1A1A1A]'
                    }`}
                  >
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <span className="text-xs font-bold text-[#101010] flex-1">{s.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#101010] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-full bg-[#F7F4EE] hover:bg-[#EAE6DC] text-[#101010] font-bold text-xs border border-[#E8E4DA] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#D8F651]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Connect With Social Media */}
        {step === 3 && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8F651] text-[#101010] text-[10px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                <HeartHandshake className="w-3.5 h-3.5 text-[#101010]" />
                <span>CONNECT WITH THE CREATOR</span>
              </div>
              <h3 className="text-2xl font-black text-[#101010] tracking-tight">
                Join our Creator Community
              </h3>
              <p className="text-xs text-[#8A867D] mt-1 font-medium">
                Follow Pawan Suda for daily AI prompt updates, Veo 3 releases & drops.
              </p>
            </div>

            {/* Social Cards */}
            <div className="space-y-3 mb-6">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/mr_pawansuda_?stkn=MTcybXluN2JjajdvNA=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white border border-[#E8E4DA] hover:border-[#101010] flex items-center justify-between gap-3 group transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <InstagramIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#101010] group-hover:underline">Instagram</h4>
                    <p className="text-[11px] text-[#8A867D]">@mr_pawansuda_ &bull; Daily AI visual drops</p>
                  </div>
                </div>
                <span className="pill-btn px-3 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-[11px] font-black group-hover:bg-[#252525]">
                  Follow &rarr;
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/pawan-suda-046923374?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white border border-[#E8E4DA] hover:border-[#101010] flex items-center justify-between gap-3 group transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <LinkedinIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#101010] group-hover:underline">LinkedIn</h4>
                    <p className="text-[11px] text-[#8A867D]">Pawan Suda &bull; Tech & AI Insights</p>
                  </div>
                </div>
                <span className="pill-btn px-3 py-1.5 rounded-full bg-[#0A66C2] text-white text-[11px] font-black group-hover:bg-[#084e96]">
                  Connect &rarr;
                </span>
              </a>
            </div>

            {/* Complete & Skip Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFinish('skipped')}
                className="w-1/3 py-3 rounded-full bg-[#F7F4EE] hover:bg-[#EAE6DC] text-[#101010] font-bold text-xs border border-[#E8E4DA] transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => handleFinish('completed')}
                className="w-2/3 py-3.5 rounded-full bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-[#101010]" />
                <span>Explore AICORN 🚀</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
