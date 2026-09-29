'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CatalogToolbarProps {
  totalCount: number;
  label?: string;
  onOpenMobileFilters?: () => void;
}

export default function CatalogToolbar({
  totalCount,
  label = 'Prompts',
  onOpenMobileFilters,
}: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'popular';
  const currentSearch = searchParams.get('q') || '';

  const [localSearch, setLocalSearch] = useState(currentSearch);

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (localSearch.trim()) {
      params.set('q', localSearch.trim());
    } else {
      params.delete('q');
    }
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6 border-b border-[#E8E4DA] mb-6">
      {/* Count & Mobile Filter Trigger */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-[#101010]">
          <span>{totalCount}</span>{' '}<span className="text-[#8A867D] font-bold text-lg">{label}</span>
        </h2>

        {onOpenMobileFilters && (
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E4DA] text-xs font-bold text-[#101010]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        )}
      </div>

      {/* Search Input & Sort Dropdown */}
      <div className="flex items-center gap-3">
        {/* Local Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A867D]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#E8E4DA] text-xs font-medium text-[#1A1A1A] placeholder:text-[#8A867D] focus:outline-none focus:border-[#101010]"
          />
        </form>

        {/* Sort Select */}
        <div className="relative shrink-0">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort catalog"
            className="appearance-none bg-white border border-[#E8E4DA] hover:border-[#101010] text-xs font-bold text-[#1A1A1A] py-2 pl-3.5 pr-8 rounded-full cursor-pointer focus:outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="copies">Most Copied</option>
            <option value="latest">Latest Added</option>
            <option value="trending">Trending Now</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A867D] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
