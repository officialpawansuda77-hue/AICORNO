import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <img
            src="/logo.png"
            alt="AICORN"
            className="w-10 h-10 rounded-2xl object-cover shadow-md"
          />
          <span className="text-2xl font-black tracking-tight text-[#101010]">AICORN</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-[#101010]">Create your account</h1>
        <p className="text-sm text-[#8A867D] mt-1">Join the community of creators, filmmakers, and AI artists.</p>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignUp
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
