-- ====================================================================
-- AICORN PRODUCTION SUPABASE SCHEMA & RLS POLICIES
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'both' CHECK (type IN ('image', 'video', 'both')),
    cover_image TEXT,
    prompt_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MODELS TABLE
CREATE TABLE IF NOT EXISTS public.models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    prompt_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PROMPTS TABLE
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    model_id UUID REFERENCES public.models(id) ON DELETE SET NULL,
    style TEXT,
    aspect_ratio TEXT,
    duration TEXT,
    camera TEXT,
    lighting TEXT,
    image_url TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    trending BOOLEAN NOT NULL DEFAULT FALSE,
    views_count INTEGER NOT NULL DEFAULT 0,
    copies_count INTEGER NOT NULL DEFAULT 0,
    favorites_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROMPT_TAGS JOIN TABLE
CREATE TABLE IF NOT EXISTS public.prompt_tags (
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);

-- 8. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_prompt_favorite UNIQUE (user_id, prompt_id)
);

-- 9. PROMPT_VIEWS TABLE
CREATE TABLE IF NOT EXISTS public.prompt_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PROMPT_COPIES TABLE
CREATE TABLE IF NOT EXISTS public.prompt_copies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    model_id UUID REFERENCES public.models(id) ON DELETE SET NULL,
    image_url TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_subcategory_id ON public.prompts(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_prompts_model_id ON public.prompts(model_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON public.prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON public.prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON public.prompts(featured);
CREATE INDEX IF NOT EXISTS idx_prompts_trending ON public.prompts(trending);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copies_count ON public.prompts(copies_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_views_count ON public.prompts(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_favorites_count ON public.prompts(favorites_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_models_slug ON public.models(slug);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON public.favorites(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_views_prompt_id ON public.prompt_views(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_copies_prompt_id ON public.prompt_copies(prompt_id);

-- GIN Index for PostgreSQL Full-Text Search
CREATE INDEX IF NOT EXISTS idx_prompts_search ON public.prompts USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(prompt, '') || ' ' || coalesce(style, ''))
);

-- ====================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ====================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE (id = user_uid OR user_id = user_uid) AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment copy count
CREATE OR REPLACE FUNCTION public.handle_prompt_copy()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.prompts
    SET copies_count = copies_count + 1
    WHERE id = NEW.prompt_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_prompt_copied ON public.prompt_copies;
CREATE TRIGGER on_prompt_copied
    AFTER INSERT ON public.prompt_copies
    FOR EACH ROW EXECUTE FUNCTION public.handle_prompt_copy();

-- Trigger to increment/decrement favorite count
CREATE OR REPLACE FUNCTION public.handle_prompt_favorite()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.prompts SET favorites_count = favorites_count + 1 WHERE id = NEW.prompt_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.prompts SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = OLD.prompt_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_prompt_favorited ON public.favorites;
CREATE TRIGGER on_prompt_favorited
    AFTER INSERT OR DELETE ON public.favorites
    FOR EACH ROW EXECUTE FUNCTION public.handle_prompt_favorite();

-- Trigger to create profile when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.email || '.png'),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id OR public.is_admin(auth.uid()));

-- CATEGORIES
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
CREATE POLICY "Categories are readable by everyone"
    ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL USING (public.is_admin(auth.uid()));

-- SUBCATEGORIES
DROP POLICY IF EXISTS "Subcategories are readable by everyone" ON public.subcategories;
CREATE POLICY "Subcategories are readable by everyone"
    ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.subcategories;
CREATE POLICY "Admins can manage subcategories"
    ON public.subcategories FOR ALL USING (public.is_admin(auth.uid()));

-- MODELS
DROP POLICY IF EXISTS "Models are readable by everyone" ON public.models;
CREATE POLICY "Models are readable by everyone"
    ON public.models FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage models" ON public.models;
CREATE POLICY "Admins can manage models"
    ON public.models FOR ALL USING (public.is_admin(auth.uid()));

-- TAGS
DROP POLICY IF EXISTS "Tags are readable by everyone" ON public.tags;
CREATE POLICY "Tags are readable by everyone"
    ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags"
    ON public.tags FOR ALL USING (public.is_admin(auth.uid()));

-- PROMPTS
DROP POLICY IF EXISTS "Published prompts are viewable by everyone" ON public.prompts;
CREATE POLICY "Published prompts are viewable by everyone"
    ON public.prompts FOR SELECT
    USING (status = 'published' OR public.is_admin(auth.uid()) OR created_by = auth.uid());

DROP POLICY IF EXISTS "Admins can insert prompts" ON public.prompts;
CREATE POLICY "Admins can insert prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update prompts" ON public.prompts;
CREATE POLICY "Admins can update prompts"
    ON public.prompts FOR UPDATE
    USING (public.is_admin(auth.uid()) OR created_by = auth.uid());

DROP POLICY IF EXISTS "Admins can delete prompts" ON public.prompts;
CREATE POLICY "Admins can delete prompts"
    ON public.prompts FOR DELETE
    USING (public.is_admin(auth.uid()));

-- PROMPT_TAGS
DROP POLICY IF EXISTS "Prompt tags are viewable by everyone" ON public.prompt_tags;
CREATE POLICY "Prompt tags are viewable by everyone"
    ON public.prompt_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage prompt tags" ON public.prompt_tags;
CREATE POLICY "Admins can manage prompt tags"
    ON public.prompt_tags FOR ALL USING (public.is_admin(auth.uid()));

-- FAVORITES
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- PROMPT_VIEWS
DROP POLICY IF EXISTS "Anyone can record a view" ON public.prompt_views;
CREATE POLICY "Anyone can record a view"
    ON public.prompt_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Views are viewable by admins" ON public.prompt_views;
CREATE POLICY "Views are viewable by admins"
    ON public.prompt_views FOR SELECT USING (public.is_admin(auth.uid()));

-- PROMPT_COPIES
DROP POLICY IF EXISTS "Anyone can record a copy" ON public.prompt_copies;
CREATE POLICY "Anyone can record a copy"
    ON public.prompt_copies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Copies are viewable by admins" ON public.prompt_copies;
CREATE POLICY "Copies are viewable by admins"
    ON public.prompt_copies FOR SELECT USING (public.is_admin(auth.uid()));

-- SUBMISSIONS
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
CREATE POLICY "Users can view their own submissions"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
CREATE POLICY "Users can create submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;
CREATE POLICY "Admins can update submissions"
    ON public.submissions FOR UPDATE
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete submissions" ON public.submissions;
CREATE POLICY "Admins can delete submissions"
    ON public.submissions FOR DELETE
    USING (public.is_admin(auth.uid()));

-- ====================================================================
-- SUPABASE STORAGE BUCKETS & POLICIES (SINGLE MEDIA HOST)
-- ====================================================================

-- 1. Create Native Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('prompt-images', 'prompt-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('prompt-videos', 'prompt-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('prompt-thumbnails', 'prompt-thumbnails', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('user-submissions', 'user-submissions', true, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies
DROP POLICY IF EXISTS "Public media is accessible by everyone" ON storage.objects;
CREATE POLICY "Public media is accessible by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('prompt-images', 'prompt-videos', 'prompt-thumbnails', 'user-submissions'));

DROP POLICY IF EXISTS "Authenticated users can upload submissions" ON storage.objects;
CREATE POLICY "Authenticated users can upload submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-submissions' AND 
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can manage all storage buckets" ON storage.objects;
CREATE POLICY "Admins can manage all storage buckets"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('prompt-images', 'prompt-videos', 'prompt-thumbnails', 'user-submissions') AND
    (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
  )
  WITH CHECK (
    bucket_id IN ('prompt-images', 'prompt-videos', 'prompt-thumbnails', 'user-submissions') AND
    (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
  );
