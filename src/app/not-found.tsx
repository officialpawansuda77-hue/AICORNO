import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#101010] text-[#D8F651] text-2xl font-black mb-6">
        404
      </div>
      <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
        This page wandered off.
      </h1>
      <p className="text-sm sm:text-base text-[#8A867D] mt-3 max-w-lg mx-auto">
        The prompt or page you requested does not exist. Try the catalog or return to the AICORN homepage.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/"
          className="pill-btn inline-flex items-center gap-2 px-5 py-3 bg-[#101010] text-[#D8F651] font-black text-sm rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <Link
          href="/prompts/image"
          className="pill-btn inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#E8E4DA] text-[#101010] font-black text-sm rounded-full"
        >
          <Search className="w-4 h-4" />
          Browse prompts
        </Link>
      </div>
    </div>
  );
}
