'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { ExternalLink, Plus, Calendar, Tag, ArrowUpRight, MessageSquareQuote } from 'lucide-react';

export default function BlogPage() {
  const { blogPosts, currentUser } = useAppStore();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] text-[#D8F651] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#D8F651]" />
            <span>COMMUNITY UPDATES & POSTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
            AICORN Updates & Links
          </h1>
          <p className="text-sm sm:text-base text-[#8A867D] mt-3 font-medium leading-relaxed">
            Latest releases, model breakdowns, and official announcements curated directly from our team and social channels.
          </p>

          {currentUser?.role === 'admin' && (
            <div className="mt-6">
              <Link
                href="/admin"
                className="pill-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D8F651] text-[#101010] font-black text-xs shadow-sm hover:bg-[#C5E53E]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Post / Link in Admin Panel</span>
              </Link>
            </div>
          )}
        </div>

        {/* Dynamic Posts or Empty State */}
        {blogPosts.length === 0 ? (
          <div className="aicorn-card p-12 sm:p-16 text-center max-w-xl mx-auto bg-white">
            <div className="w-16 h-16 rounded-3xl bg-[#101010] text-[#D8F651] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-2xl font-black">𝕏</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#101010] mb-2">
              No Blog Posts Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#8A867D] mb-8 leading-relaxed">
              We publish prompt drop announcements, agent workflows, and guides on X (Twitter). Follow along to catch every new release!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/mr_pawansuda_?stkn=MTcybXluN2JjajdvNA=="
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn w-full sm:w-auto px-6 py-3 bg-[#101010] hover:bg-[#252525] text-white font-black text-xs rounded-full flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Follow @aicorn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {currentUser?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="pill-btn w-full sm:w-auto px-6 py-3 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] font-black text-xs rounded-full flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post First Link</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aicorn-card p-6 bg-white flex flex-col justify-between group hover:border-[#101010] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#101010] text-[#D8F651] text-[10px] uppercase font-black tracking-wider">
                      {post.platform === 'x' ? '𝕏 Post' : post.platform.toUpperCase()}
                    </span>
                    {post.tag && (
                      <span className="text-[11px] font-bold text-[#8A867D] flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-[#101010] leading-snug group-hover:text-black mb-2 flex items-start justify-between gap-2">
                    <span>{post.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#8A867D] group-hover:text-[#101010] shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>

                  {post.description && (
                    <p className="text-xs text-[#8A867D] line-clamp-3 leading-relaxed mb-6 font-medium">
                      {post.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#F0EDE6] flex items-center justify-between text-xs text-[#8A867D]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <span className="text-[#101010] font-black group-hover:underline flex items-center gap-1">
                    Open Link &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
