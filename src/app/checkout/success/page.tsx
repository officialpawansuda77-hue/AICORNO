'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';

export default function CheckoutReturnPage() {
  const { currentUser, refreshMembership } = useAppStore();
  const [status, setStatus] = useState<'checking' | 'waiting' | 'active'>('checking');

  useEffect(() => {
    if (!currentUser) return;
    let stopped = false;
    let count = 0;
    const check = async () => {
      try {
        const tier = await refreshMembership();
        if (stopped) return;
        if (tier !== 'free') { setStatus('active'); return; }
      } catch { /* Webhook or database may still be processing. */ }
      if (stopped) return;
      setStatus('waiting');
      if (++count < 6) timer = setTimeout(check, 5000);
    };
    let timer: ReturnType<typeof setTimeout>;
    void check();
    return () => { stopped = true; clearTimeout(timer); };
  }, [currentUser?.id, refreshMembership]);

  return <AppLayout><div className="max-w-xl mx-auto px-4 py-24 text-center">
    <h1 className="text-3xl font-black text-[#101010] mb-4">{status === 'active' ? 'Your membership is active' : 'Checking your membership'}</h1>
    <p className="text-sm text-[#8A867D] mb-8">{status === 'active'
      ? 'Your subscription was confirmed. Your access is ready.'
      : 'Dodo Payments is confirming your subscription. This page does not grant access until confirmation arrives. If it takes longer, revisit your dashboard.'}</p>
    <Link href="/dashboard" className="pill-btn inline-block px-6 py-3 rounded-full bg-[#101010] text-[#D8F651] font-bold text-xs">Go to dashboard</Link>
  </div></AppLayout>;
}
