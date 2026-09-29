'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Shield,
  LogOut,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Bot,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { isUserAdmin } from '@/lib/authUtils';
import SearchModal from '@/components/ui/SearchModal';

export default function Header() {
  const pathname = usePathname();
  const { favorites, currentUser, logout, setAuthModalOpen } = useAppStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPromptsDropdownOpen, setIsPromptsDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const promptsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (promptsRef.current && !promptsRef.current.contains(event.target as Node)) {
        setIsPromptsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenus = () => {
    setIsPromptsDropdownOpen(false);
    setIsCategoriesDropdownOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Global Ctrl+K / Cmd+K search shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if it's a repeated key event or if Shift/Alt is held
      if (e.repeat || e.shiftKey || e.altKey) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }
    // Capture the shortcut before focused inputs or browser handlers can
    // swallow it. Both shortcuts are supported on every platform.
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E8E4DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* LEFT: AICORN Brand Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" onClick={closeMenus} className="flex items-center gap-2.5 group">
              {/* Official AICORN Logo */}
              <img
                src="/logo.png"
                alt="AICORN"
                className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex items-center">
                <span className="text-xl font-black tracking-tight text-[#101010]">
                  AICORN
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B26] ml-1 mb-2"></span>
              </div>
            </Link>

            {/* Desktop Center Navigation */}
            <nav className="hidden lg:flex items-center gap-1 font-semibold text-sm text-[#1A1A1A]">
              {/* Prompts Dropdown */}
              <div className="relative" ref={promptsRef}>
                <button
                  onClick={() => setIsPromptsDropdownOpen(!isPromptsDropdownOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${
                    pathname.startsWith('/prompts') ? 'text-[#101010] font-bold bg-black/5' : 'text-[#1A1A1A]'
                  }`}
                >
                  <span>Prompts</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPromptsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPromptsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E4DA] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href="/prompts/image"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F4EE] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] text-[#101010] flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-[#101010]" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#1A1A1A]">Image Prompts</div>
                        <div className="text-[11px] text-[#8A867D]">Midjourney, Flux, SDXL</div>
                      </div>
                    </Link>
                    <Link
                      href="/prompts/video"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F4EE] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FFF0D4] text-[#101010] flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-[#101010]" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#1A1A1A]">Video Prompts</div>
                        <div className="text-[11px] text-[#8A867D]">Veo 3, Kling, Sora, Runway</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Skills Link */}
              <Link
                href="/skills"
                className={`px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${
                  pathname.startsWith('/skills') ? 'text-[#101010] font-bold bg-black/5' : 'text-[#1A1A1A]'
                }`}
              >
                Skills
              </Link>

              {/* Categories Mega Menu Dropdown (Matching Reference Screenshot 3) */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${
                    pathname.startsWith('/categories') ? 'text-[#101010] font-bold bg-black/5' : 'text-[#1A1A1A]'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoriesDropdownOpen && (
                  <div className="absolute top-full -left-20 mt-2 w-[720px] bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-3 gap-6">
                      
                      {/* By Use Case */}
                      <div className="p-4 rounded-2xl bg-[#F7F4EE]/60 border border-[#E8E4DA]/60">
                        <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                          By Use Case
                        </h4>
                        <p className="text-[11px] text-[#8A867D] mb-3">Popular picks. Explore all.</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: 'Site pages', slug: 'architecture' },
                            { name: 'Social content', slug: 'social-media' },
                            { name: 'Client decks', slug: 'product-ads' },
                            { name: 'Brand assets', slug: 'luxury' },
                            { name: 'UI design', slug: '3d' },
                            { name: 'Infographics', slug: 'cinematic' },
                            { name: 'Automotive', slug: 'automotive' },
                            { name: 'Brand films', slug: 'fashion' },
                          ].map((item) => (
                            <Link
                              key={item.name}
                              href={`/categories/${item.slug}`}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#D8F651] text-[#1A1A1A] text-xs font-bold transition-colors text-center border border-[#E8E4DA]"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* By Role */}
                      <div className="p-4 rounded-2xl bg-[#F7F4EE]/60 border border-[#E8E4DA]/60">
                        <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                          By Role
                        </h4>
                        <p className="text-[11px] text-[#8A867D] mb-3">Start with the work you do.</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: 'Creator', slug: 'ugc' },
                            { name: 'Founder', slug: 'product-ads' },
                            { name: 'E-commerce', slug: 'e-commerce' },
                            { name: 'Designer', slug: '3d' },
                            { name: 'Consultant', slug: 'architecture' },
                            { name: 'Teacher', slug: 'food' },
                            { name: 'Marketer', slug: 'social-media' },
                            { name: 'Researcher', slug: 'cinematic' },
                          ].map((item) => (
                            <Link
                              key={item.name}
                              href={`/categories/${item.slug}`}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#D8F651] text-[#1A1A1A] text-xs font-bold transition-colors text-center border border-[#E8E4DA]"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* By Output */}
                      <div className="p-4 rounded-2xl bg-[#F7F4EE]/60 border border-[#E8E4DA]/60 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                            By Output
                          </h4>
                          <p className="text-[11px] text-[#8A867D] mb-3">Browse the final format.</p>
                          <div className="space-y-1.5">
                            {[
                              { name: 'AI Image Prompts', href: '/prompts/image', icon: ImageIcon },
                              { name: 'AI Video Prompts', href: '/prompts/video', icon: Video },
                              { name: 'Agent Skills & Code', href: '/skills', icon: Bot },
                              { name: 'Visual Moodboards', href: '/categories', icon: FolderOpen },
                            ].map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-[#D8F651] text-[#1A1A1A] text-xs font-bold transition-colors border border-[#E8E4DA]"
                                >
                                  <Icon className="w-3.5 h-3.5 text-[#101010]" />
                                  <span>{item.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        <Link
                          href="/categories"
                          className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#D8F651] hover:bg-[#C5E53E] text-[#101010] text-xs font-extrabold rounded-full transition-transform active:scale-95 shadow-sm"
                        >
                          <span>Browse all Categories</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Link */}
              <Link
                href="/pricing"
                className={`px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${
                  pathname === '/pricing' ? 'text-[#101010] font-bold bg-black/5' : 'text-[#1A1A1A]'
                }`}
              >
                Pricing
              </Link>

              {/* Blog Link */}
              <Link
                href="/blog"
                className={`px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${
                  pathname.startsWith('/blog') ? 'text-[#101010] font-bold bg-black/5' : 'text-[#1A1A1A]'
                }`}
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* CENTER: Rounded Search Pill */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2 sm:mx-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
              aria-keyshortcuts="Control+K Meta+K"
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-white border border-[#E8E4DA] hover:border-[#101010] text-[#8A867D] hover:text-[#1A1A1A] transition-all text-xs sm:text-sm shadow-sm group"
            >
              <span className="truncate">What do you want to create?</span>
              <div className="flex items-center gap-1.5 shrink-0 text-[#8A867D] group-hover:text-[#101010]">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F7F4EE] border border-[#E8E4DA] rounded-md">
                  ⌘K
                </kbd>
                <Search className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* RIGHT: Actions (Favorites, Submit, User Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Compact mobile search keeps the header usable at 390px. */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
              className="sm:hidden p-2 rounded-full hover:bg-black/5 text-[#1A1A1A]"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Submit Prompt Pill Button */}
            <Link
              href="/submit"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#101010] hover:bg-[#101010] hover:text-white text-[#101010] font-bold text-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit</span>
            </Link>

            {/* Favorites Icon Button with Badge */}
            <Link
              href="/favorites"
              aria-label="Favorites"
              className="hidden sm:inline-flex relative p-2.5 rounded-full hover:bg-black/5 text-[#1A1A1A] transition-colors"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-[#FF4B26] fill-[#FF4B26]' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#101010] text-[#D8F651] text-[10px] font-black flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* User Profile or Sign In */}
            {currentUser ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 bg-white border border-[#E8E4DA] hover:border-[#101010] rounded-full transition-all"
                >
                  <span className="text-xs font-bold text-[#1A1A1A] hidden md:inline">
                    {currentUser.name}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E8E4DA]"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#E8E4DA] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-[#E8E4DA]/60 mb-1">
                      <p className="text-xs font-extrabold text-[#1A1A1A]">{currentUser.name}</p>
                      <p className="text-[11px] text-[#8A867D] truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-[#D8F651] text-[#101010]">
                          {currentUser.role}
                        </span>
                        {currentUser.is_pro && (
                          <span className="text-[9px] font-bold text-[#FF4B26]">PRO MEMBER</span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F7F4EE] text-xs font-bold text-[#1A1A1A] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#8A867D]" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F7F4EE] text-xs font-bold text-[#1A1A1A] transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#8A867D]" />
                      <span>Saved Prompts</span>
                    </Link>

                    {isUserAdmin(currentUser) && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F7F4EE] text-xs font-bold text-[#1A1A1A] transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#8A867D]" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FEECEC] text-xs font-bold text-[#FF4B26] transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:inline-flex bg-[#101010] hover:bg-[#252525] text-white font-bold text-xs px-4 py-2 rounded-full transition-transform active:scale-95"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-black/5 text-[#1A1A1A]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div onClick={closeMenus} className="lg:hidden bg-white border-b border-[#E8E4DA] px-6 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 text-sm font-bold">
              <Link
                href="/prompts/image"
                className="p-3 rounded-2xl bg-[#F7F4EE] flex items-center gap-2 text-[#1A1A1A]"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Prompts</span>
              </Link>
              <Link
                href="/prompts/video"
                className="p-3 rounded-2xl bg-[#F7F4EE] flex items-center gap-2 text-[#1A1A1A]"
              >
                <Video className="w-4 h-4" />
                <span>Video Prompts</span>
              </Link>
              <Link
                href="/skills"
                className="p-3 rounded-2xl bg-[#F7F4EE] flex items-center gap-2 text-[#1A1A1A]"
              >
                <Bot className="w-4 h-4" />
                <span>AI Agent Skills</span>
              </Link>
              <Link
                href="/categories"
                className="p-3 rounded-2xl bg-[#F7F4EE] flex items-center gap-2 text-[#1A1A1A]"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Categories</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-[#E8E4DA] flex flex-wrap items-center gap-4 text-sm font-bold">
              <Link href="/pricing" className="text-[#1A1A1A] hover:underline">
                Pricing
              </Link>
              <Link href="/blog" className="text-[#1A1A1A] hover:underline">
                Blog
              </Link>
              <Link href="/submit" className="text-[#101010] hover:underline">
                Submit Prompt
              </Link>
              {isUserAdmin(currentUser) && (
                <Link href="/admin" className="text-[#8A867D] hover:underline">
                  Admin
                </Link>
              )}
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-[#FF4B26] hover:underline"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="text-[#101010] hover:underline"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
