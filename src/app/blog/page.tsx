import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { BLOG_POSTS } from '@/data/blogData';
import { Sparkles, ArrowRight, BookOpen, Clock } from 'lucide-react';

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>EDITORIAL & PROMPT ENGINEERING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            AICORN Guides & Insights
          </h1>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium leading-relaxed">
            In-depth guides on camera pacing, physics prompts, autonomous agent architecture, and visual taste.
          </p>
        </div>

        {/* Featured Article Hero */}
        {featured && (
          <div className="mb-14">
            <Link
              href={`/blog/${featured.slug}`}
              className="aicorn-card group block overflow-hidden bg-white hover:border-[#101010]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 h-72 sm:h-96 overflow-hidden">
                  <img
                    src={featured.cover_image}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#D8F651] text-[#101010] text-xs font-black uppercase tracking-wider">
                        {featured.category}
                      </span>
                      <span className="text-xs text-[#8A867D] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featured.read_time}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#101010] group-hover:text-black leading-tight mb-3">
                      {featured.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#8A867D] leading-relaxed line-clamp-3 mb-6 font-medium">
                      {featured.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#F0EDE6]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={featured.author.avatar}
                        alt={featured.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#101010]">{featured.author.name}</div>
                        <div className="text-[10px] text-[#8A867D]">{featured.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-xs text-[#101010] group-hover:underline">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="aicorn-card group flex flex-col overflow-hidden bg-white"
            >
              <div className="h-52 overflow-hidden bg-[#EDEDEA]">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A867D] mb-2 font-bold">
                    <span className="text-[#101010] uppercase tracking-wider">{post.category}</span>
                    <span>{post.read_time}</span>
                  </div>

                  <h3 className="text-lg font-black text-[#101010] leading-snug group-hover:underline mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#8A867D] line-clamp-3 leading-relaxed font-medium mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-4 border-t border-[#F0EDE6]">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-xs font-bold text-[#101010] truncate">
                    {post.author.name}
                  </div>
                  <div className="text-[10px] text-[#8A867D] ml-auto shrink-0">
                    {post.date}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
