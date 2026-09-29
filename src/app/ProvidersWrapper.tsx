'use client';

import React from 'react';
import { AppProvider } from '@/lib/store';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/ToastContainer';
import AuthModal from '@/components/ui/AuthModal';
import UpgradeModal from '@/components/ui/UpgradeModal';
import OnboardingSurveyModal from '@/components/ui/OnboardingSurveyModal';
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

export default function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
      <AuthModal />
      <UpgradeModal />
      <OnboardingSurveyModal />
      <CookieConsentBanner />
    </AppProvider>
  );
}
