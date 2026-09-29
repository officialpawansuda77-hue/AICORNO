'use client';

import { use } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { BLOG_POSTS } from '@/data/blogData';
import { ArrowLeft, Clock, Share2, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToast } = useAppStore();

  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-[#101010] mb-2">Article Not Found</h2>
          <Link
            href="/blog"
            className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Guides</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({ title: 'Article Link Copied!', message: 'Shareable article URL saved to clipboard.', type: 'success' });
    }
  };

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <AppLayout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E8E4DA] text-xs font-semibold text-[#8A867D]">
          <Link href="/blog" className="flex items-center gap-1.5 text-[#101010] hover:underline font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all guides</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-[#101010] hover:text-black font-bold p-1 rounded-full"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Title & Metadata */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#D8F651] text-[#101010] text-xs font-black uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-xs text-[#8A867D] font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-[#E8E4DA]"
            />
            <div>
              <div className="text-sm font-bold text-[#101010]">{post.author.name}</div>
              <div className="text-xs text-[#8A867D]">{post.author.role} &bull; {post.date}</div>
            </div>
          </div>
        </div>

        {/* Hero Cover */}
        <div className="rounded-[28px] overflow-hidden mb-12 border border-[#E8E4DA] shadow-md h-80 sm:h-96">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Content */}
        <MarkdownContent
          content={post.content}
          className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed space-y-6 text-sm sm:text-base"
        />

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#E8E4DA]">
            <h3 className="text-2xl font-black text-[#101010] mb-6">
              More Guides & Tutorials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="aicorn-card p-5 block group"
                >
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#8A867D]">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold text-[#101010] group-hover:underline mt-1 mb-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-[#8A867D]">
                    <span>{item.read_time}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
    </AppLayout>
  );
}
