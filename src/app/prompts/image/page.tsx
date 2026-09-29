'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import PromptCard from '@/components/cards/PromptCard';
import { fetchPromptsFromDb } from '@/lib/supabaseService';
import { Prompt } from '@/types';
import { Sparkles, SlidersHorizontal, X, RotateCcw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

function ImagePromptsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const selectedCategory = searchParams.get('category') || undefined;
  const selectedModel = searchParams.get('model') || undefined;
  const selectedStyle = searchParams.get('style') || undefined;
  const selectedRatio = searchParams.get('ratio') || undefined;
  const selectedPrice = (searchParams.get('price') as 'free' | 'pro') || undefined;
  const currentSort = (searchParams.get('sort') as any) || 'popular';
  const query = searchParams.get('q') || undefined;
  const currentPage = Number(searchParams.get('page')) || 1;

  const loadPrompts = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetchPromptsFromDb({
        type: 'image',
        category: selectedCategory,
        model: selectedModel,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        price: selectedPrice,
        sort: currentSort,
        search: query,
        page: currentPage,
        limit: 18,
      });

      setPrompts(res.prompts);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load prompts:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory, selectedModel, selectedStyle, selectedRatio, selectedPrice, currentSort, query, currentPage]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E4DA] text-xs font-black uppercase tracking-wider text-[#101010] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D8F651] fill-[#D8F651]" />
          <span>DATABASE-POWERED VISUAL GALLERY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#101010] tracking-tight">
          Image Prompts
        </h1>
        <p className="text-sm sm:text-base text-[#8A867D] mt-2 max-w-2xl font-medium">
          Explore visual prompts for creating images with Midjourney, Flux.1 Pro, and Nano Banana.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <FilterSidebar type="image" />
        </div>

        {/* Right Main Catalog Content */}
        <div className="flex-1 w-full">
          <CatalogToolbar
            totalCount={totalCount}
            label="Image Prompts"
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#101010] border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-[#8A867D]">Querying Supabase database...</p>
            </div>
          ) : hasError ? (
            /* Error State with Retry Button */
            <div className="bg-white rounded-3xl border border-[#FCCECE] p-12 text-center my-6">
              <div className="w-12 h-12 rounded-full bg-[#FEECEC] text-[#FF4B26] flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101010] mb-1">
                Unable to load prompts from database
              </h3>
              <p className="text-xs text-[#8A867D] mb-5">
                Check your network connection or Supabase status.
              </p>
              <button
                onClick={loadPrompts}
                className="pill-btn px-5 py-2.5 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Query</span>
              </button>
            </div>
          ) : prompts.length > 0 ? (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {prompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>

              {/* Database-Level Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-[#E8E4DA]">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2.5 rounded-full bg-white border border-[#E8E4DA] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F4EE]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#101010]">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-9 h-9 rounded-full transition-all ${
                          currentPage === i + 1
                            ? 'bg-[#101010] text-[#D8F651]'
                            : 'bg-white border border-[#E8E4DA] hover:bg-[#F7F4EE]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2.5 rounded-full bg-white border border-[#E8E4DA] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F4EE]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-14 text-center my-6">
              <h3 className="text-lg font-bold text-[#101010] mb-1">
                No image prompts found
              </h3>
              <p className="text-xs text-[#8A867D] mb-5">
                Try adjusting your filters or clearing search criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="pill-btn px-4 py-2 bg-[#101010] text-[#D8F651] text-xs font-bold rounded-full"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA] mb-6">
              <h3 className="font-black text-sm uppercase">Filter Images</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-full text-[#8A867D] hover:text-[#101010]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar type="image" />
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="mt-8 w-full py-3 bg-[#101010] text-[#D8F651] font-bold text-xs rounded-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImagePromptsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#8A867D]">Loading Image Prompts...</div>}>
        <ImagePromptsContent />
      </Suspense>
    </AppLayout>
  );
}
