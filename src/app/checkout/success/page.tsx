'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { CheckCircle2, Sparkles, ArrowRight, Home, LayoutDashboard, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutReturnPage() {
  const router = useRouter();
  const { currentUser, refreshMembership } = useAppStore();
  const [status, setStatus] = useState<'checking' | 'waiting' | 'active'>('checking');
  const [countdown, setCountdown] = useState<number>(4);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D8F651', '#FF4B26', '#101010', '#FFFFFF'],
      });
    } catch {}
  }, []);

  // Membership status verification
  useEffect(() => {
    if (!currentUser) return;
    let stopped = false;
    let count = 0;

    const check = async () => {
      try {
        const tier = await refreshMembership();
        if (stopped) return;
        if (tier !== 'free') {
          setStatus('active');
          return;
        }
      } catch {}

      if (stopped) return;
      setStatus('waiting');
      if (++count < 6) timer = setTimeout(check, 4000);
    };

    let timer: ReturnType<typeof setTimeout>;
    void check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [currentUser?.id, refreshMembership]);

  // Countdown runs only when membership status is active; state updater stays pure
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Redirect when countdown reaches zero
  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
    }
  }, [countdown, router]);

  const planName =
    currentUser?.membership === 'pro' || currentUser?.is_pro
      ? 'Pro Unlimited ($9.99/mo)'
      : currentUser?.membership === 'starter'
      ? 'Starter Creator ($4.49/mo)'
      : 'AICORN Subscription';

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-20 sm:py-28 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#D8F651] text-[#101010] mb-6 shadow-lg animate-bounce">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PAYMENT SUCCESSFUL</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#101010] mb-3 tracking-tight">
          Welcome to {planName}!
        </h1>

        <p className="text-sm text-[#8A867D] mb-6 leading-relaxed max-w-md mx-auto">
          {status === 'active'
            ? <>Your payment was processed successfully by <strong>Dodo Payments</strong>. Your membership privileges are active.</>
            : <>Your payment is being processed. Please wait a moment while we confirm your membership.</>}
        </p>

        {/* Redirect notice banner */}
        <div className="mb-8 p-3.5 rounded-2xl bg-white border border-[#E8E4DA] text-xs text-[#1A1A1A] font-semibold flex items-center justify-center gap-2 shadow-2xs">
          <Loader2 className="w-4 h-4 animate-spin text-[#101010]" />
          <span>Redirecting to Homepage in <strong>{countdown}s</strong>...</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="pill-btn w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#101010] hover:bg-[#252525] text-[#D8F651] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="pill-btn w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-[#F7F4EE] text-[#101010] font-bold text-xs border border-[#E8E4DA] flex items-center justify-center gap-2 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-[#8A867D]" />
            <span>View Dashboard</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
