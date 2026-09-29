import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#101010] flex items-center justify-center shadow-md">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 12V18" stroke="#D8F651" strokeWidth="4" strokeLinecap="round" />
              <path d="M19 22C19 20 20.8 18 23 18H41C43.2 18 45 20 45 22V23C45 23.6 44.6 24 44 24H20C19.4 24 19 23.6 19 23V22Z" fill="#D8F651" />
              <path d="M20 26C20 26 20.5 44 32 48C43.5 44 44 26 44 26H20Z" fill="#FF4B26" />
              <circle cx="32" cy="34" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-[#101010]">AICORN</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-[#101010]">Sign in to your account</h1>
        <p className="text-sm text-[#8A867D] mt-1">Discover, create, and collect elite AI prompts.</p>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#101010',
              borderRadius: '1.25rem',
              fontFamily: 'var(--font-nunito)',
            },
            elements: {
              card: 'border border-[#E8E4DA] shadow-xl rounded-[28px] p-6 sm:p-8 bg-white',
              formButtonPrimary: 'bg-[#101010] hover:bg-[#202020] text-[#D8F651] font-bold rounded-full py-3',
              socialButtonsBlockButton: 'rounded-2xl border-[#E8E4DA] hover:bg-[#F7F4EE]',
              formFieldInput: 'rounded-2xl bg-[#F7F4EE] border-[#E8E4DA]',
            },
          }}
        />
      </div>
    </div>
  );
}
