import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { Shield, Lock, Eye, Database, Globe, UserCheck, ExternalLink } from 'lucide-react';

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
            <Shield className="w-3.5 h-3.5 text-[#101010] fill-[#D8F651]" />
            <span>TRANSPARENCY & DATA GOVERNANCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium">
            Last updated: March 2026. How AICORN, founded by Pawan Suda, manages and safeguards your data.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-[#1A1A1A]">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#101010] font-black text-xl sm:text-2xl">
              <Eye className="w-5 h-5 text-[#FF4B26]" />
              <h2>1. Introduction & Business Details</h2>
            </div>
            <p className="text-[#1A1A1A]/85">
              Welcome to <strong>AICORN</strong> (https://aicorn-ai.vercel.app/). AICORN is an open-access AI prompt curation directory founded and maintained by <strong>Pawan Suda</strong>. We are committed to transparency, creator privacy, and respectful handling of personal data across all jurisdictions.
            </p>
            <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] text-xs sm:text-sm text-[#101010] space-y-1 shadow-xs">
              <p><strong>Platform Operator:</strong> Pawan Suda / AICORN Team</p>
              <p><strong>Primary Inquiries:</strong> <a href="mailto:curators@aicorn.design" className="font-bold underline text-[#FF4B26]">curators@aicorn.design</a></p>
              <p><strong>Founder Social Profiles:</strong>{' '}
                <a href="https://www.linkedin.com/in/pawan-suda-046923374?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#101010] hover:text-[#FF4B26]">LinkedIn</a>,{' '}
                <a href="https://x.com/Pawan0Suda" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#101010] hover:text-[#FF4B26]">X (Twitter)</a>,{' '}
                <a href="https://www.instagram.com/mr_pawansuda_?stkn=MTcybXluN2JjajdvNA==" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#101010] hover:text-[#FF4B26]">Instagram</a>
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#101010] font-black text-xl sm:text-2xl">
              <Database className="w-5 h-5 text-[#101010]" />
              <h2>2. What User Data We Collect</h2>
            </div>
            <p className="text-[#1A1A1A]/85">
              We practice data minimization and collect only what is strictly necessary to run the service:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#E8E4DA]">
                <h3 className="font-black text-sm uppercase text-[#101010] mb-1">Account & Identity</h3>
                <p className="text-xs sm:text-sm text-[#8A867D]">
                  Handled securely by Clerk authentication: your name, email address, and profile photo when signing up or publishing prompts.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E4DA]">
                <h3 className="font-black text-sm uppercase text-[#101010] mb-1">Creative Submissions</h3>
                <p className="text-xs sm:text-sm text-[#8A867D]">
                  Prompts, target AI models, aspect ratios, style tags, uploaded sample images, and external video links (e.g., Google Drive or YouTube) you publish.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E4DA]">
                <h3 className="font-black text-sm uppercase text-[#101010] mb-1">Local Browser Storage</h3>
                <p className="text-xs sm:text-sm text-[#8A867D]">
                  Saved prompt bookmarks (<code className="text-[11px] bg-[#F7F4EE] px-1 py-0.5 rounded">aicorn_saved_prompts</code>) and your cookie preferences (<code className="text-[11px] bg-[#F7F4EE] px-1 py-0.5 rounded">aicorn_cookie_consent</code>) stored locally on your device.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E4DA]">
                <h3 className="font-black text-sm uppercase text-[#101010] mb-1">Technical Analytics</h3>
                <p className="text-xs sm:text-sm text-[#8A867D]">
                  Aggregated telemetry: prompt copy counts, view counts, browser family, and page load speed to optimize catalog performance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#101010] font-black text-xl sm:text-2xl">
              <Globe className="w-5 h-5 text-[#101010]" />
              <h2>3. Third-Party Embeds & Service Providers</h2>
            </div>
            <p className="text-[#1A1A1A]/85">
              To provide streaming video previews and media storage without collecting intrusive advertising trackers, we use trusted infrastructure partners:
            </p>
            <ul className="space-y-3 pl-2">
              <li className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs sm:text-sm">
                <strong>Google Drive Previews:</strong> Community video prompts may embed viewable video streams via Google Drive file preview iframes (<code className="text-[11px] bg-white px-1 py-0.5 rounded">drive.google.com/file/d/.../preview</code>). Google may process request headers according to Google&apos;s Privacy Policy.
              </li>
              <li className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs sm:text-sm">
                <strong>YouTube Embeds:</strong> When viewing video demonstrations hosted on YouTube, standard YouTube player frames are rendered.
              </li>
              <li className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs sm:text-sm">
                <strong>Supabase Storage & Database:</strong> User-uploaded images are hosted on enterprise Supabase Cloud Storage with HTTPS encryption and Row Level Security.
              </li>
              <li className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E8E4DA] text-xs sm:text-sm">
                <strong>Clerk Auth:</strong> Identity management and passwordless login tokens are encrypted by Clerk under strict SOC 2 compliance.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#101010] font-black text-xl sm:text-2xl">
              <UserCheck className="w-5 h-5 text-[#101010]" />
              <h2>4. Applicable Local Laws & User Rights</h2>
            </div>
            <p className="text-[#1A1A1A]/85">
              We respect data protection standards across the globe:
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <p><strong>GDPR (European Union):</strong> You hold the right to access, rectify, or request permanent deletion of any personal data or published prompts linked to your email address.</p>
              <p><strong>CCPA / CPRA (California, US):</strong> We do not sell or share personal information for cross-context behavioral advertising.</p>
              <p><strong>Digital Personal Data Protection Act (India DPDP Act 2023):</strong> We collect user details solely for legitimate operational purposes with explicit consent.</p>
            </div>
            <p className="text-xs sm:text-sm text-[#8A867D]">
              To exercise any of these rights, email <a href="mailto:curators@aicorn.design" className="font-bold underline text-[#101010]">curators@aicorn.design</a> with the subject line &quot;Data Privacy Request&quot;. We honor all valid requests within 7 business days.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#101010] font-black text-xl sm:text-2xl">
              <Lock className="w-5 h-5 text-[#101010]" />
              <h2>5. Cookie & Form Consent</h2>
            </div>
            <p className="text-[#1A1A1A]/85">
              By using our prompt submission forms, you grant AICORN the right to catalog your submitted prompt publicly. You may view our complete cookie breakdown and modify your tracking preferences at any time on our{' '}
              <Link href="/cookie-policy" className="font-bold underline text-[#FF4B26] hover:text-[#101010]">
                Cookie Policy page
              </Link>.
            </p>
          </section>

        </div>

      </div>
    </AppLayout>
  );
}
