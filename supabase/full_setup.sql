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

-- ====================================================================
-- SEED DATA INGESTION
-- ====================================================================

-- 1. INSERT CATEGORIES
INSERT INTO public.categories (id, name, slug, description, type, cover_image, prompt_count) VALUES
('c0000000-0000-0000-0000-000000000001', 'Automotive', 'automotive', 'Cinematic car commercials, supercar studio shots, hyper-realistic reflections, and dynamic driving scenes.', 'both', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', 2),
('c0000000-0000-0000-0000-000000000002', 'Product Ads', 'product-ads', 'High-end commercial packaging, luxury perfume glass reflections, cosmetics, and hero product lighting.', 'both', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop', 2),
('c0000000-0000-0000-0000-000000000003', 'Fashion & Editorial', 'fashion', 'Vogue-style haute couture, studio portraits, minimalist street style, and textured textile macro shots.', 'both', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', 1),
('c0000000-0000-0000-0000-000000000004', 'UGC & TikTok', 'ugc', 'Authentic creator video hooks, iPhone front-camera aesthetic, natural lighting, and unboxing clips.', 'both', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', 2),
('c0000000-0000-0000-0000-000000000005', 'Food & Beverage', 'food', 'Michelin star plating, slow-motion cocktail pours, steam rising, and mouth-watering gastronomy.', 'both', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop', 1),
('c0000000-0000-0000-0000-000000000006', 'Cinematic & Film', 'cinematic', '35mm anamorphic aspect ratios, moody atmospheric smoke, neo-noir shadows, and blockbuster color grades.', 'both', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop', 3),
('c0000000-0000-0000-0000-000000000007', 'Architecture', 'architecture', 'Brutalist concrete villas, Scandinavian timber interiors, ethereal glass facades, and architectural renderings.', 'both', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop', 1),
('c0000000-0000-0000-0000-000000000008', 'Beauty & Skincare', 'beauty', 'Dewy skin textures, water droplets, botanical serums, and clean aesthetic cosmetics photography.', 'both', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop', 0),
('c0000000-0000-0000-0000-000000000009', 'Fitness & Sports', 'fitness', 'High-octane athlete sprints, chalk dust in motion, dynamic crossfit gyms, and performance apparel.', 'both', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop', 0),
('c0000000-0000-0000-0000-000000000010', 'Real Estate', 'real-estate', 'Luxury penthouses with skyline views, infinity pool sunsets, warm evening interior staging.', 'both', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop', 0),
('c0000000-0000-0000-0000-000000000011', 'Travel & Nature', 'travel', 'Icelandic volcanic moss, tropical turquoise lagoons, Japanese alpine temples in winter mist.', 'both', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop', 0),
('c0000000-0000-0000-0000-000000000012', 'Luxury & Jewelry', 'luxury', 'Diamond facet brilliance, gold timepiece complications, velvet textures, and private aviation.', 'both', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop', 0),
('c0000000-0000-0000-0000-000000000013', '3D & Motion', '3d', 'Claymorphic characters, glassmorphism, iridescent procedural materials, and tactile physics simulations.', 'both', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', 2),
('c0000000-0000-0000-0000-000000000014', 'Anime & Illustration', 'anime', 'Makoto Shinkai sky gradients, retro 90s cyber-mecha, Studio Ghibli countryside warmth, and graphic novel lines.', 'both', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop', 1),
('c0000000-0000-0000-0000-000000000015', 'Social Media', 'social-media', 'Viral Reels layouts, carousel visual storytelling hooks, bold aesthetic typography frames.', 'both', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop', 0),
('c0000000-0000-0000-0000-000000000016', 'E-commerce', 'e-commerce', 'Amazon hero product composites, floating accessories, clean studio white and muted pastels.', 'both', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', 0)
ON CONFLICT (slug) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
cover_image = EXCLUDED.cover_image,
prompt_count = EXCLUDED.prompt_count;

-- 2. INSERT SUBCATEGORIES
INSERT INTO public.subcategories (id, category_id, name, slug, description) VALUES
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Car Commercial', 'car-commercial', 'Cinematic broadcast and social commercials'),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Supercar Studio', 'supercar-studio', 'Controlled lighting hero shots'),
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Skincare', 'skincare', 'Clean beauty bottles and moisture droplettes'),
('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Haute Couture', 'haute-couture', 'Sculptural fabrics and runway walking')
ON CONFLICT DO NOTHING;

-- 3. INSERT AI MODELS (Valid UUID hexadecimal IDs prefixed with 'd')
INSERT INTO public.models (id, name, slug, description, logo_url, website_url, prompt_count) VALUES
('d0000000-0000-0000-0000-000000000001', 'Veo 3', 'veo-3', 'Google DeepMind next-generation video model with realistic camera physics and cinematic optics.', 'https://avatar.vercel.sh/veo.png', 'https://deepmind.google/veo', 3),
('d0000000-0000-0000-0000-000000000002', 'Kling 1.5', 'kling', 'Fluid realistic human motion and long video consistency.', 'https://avatar.vercel.sh/kling.png', 'https://klingai.com', 2),
('d0000000-0000-0000-0000-000000000003', 'OpenAI Sora', 'sora', 'Massive world simulation with complex cinematic motion.', 'https://avatar.vercel.sh/sora.png', 'https://openai.com/sora', 0),
('d0000000-0000-0000-0000-000000000004', 'Midjourney v6.1', 'midjourney-v6', 'Unrivaled aesthetic coherence, hyper-realistic textures, and artistic lighting.', 'https://avatar.vercel.sh/midjourney.png', 'https://midjourney.com', 2),
('d0000000-0000-0000-0000-000000000005', 'Nano Banana', 'nano-banana', 'Fine-tuned commercial generation model optimized for high-converting social ads.', 'https://avatar.vercel.sh/banana.png', 'https://aicorn.design/banana', 3),
('d0000000-0000-0000-0000-000000000006', 'Runway Gen-3', 'runway-gen3', 'Expressive camera direction, photorealistic lighting and stylized VFX.', 'https://avatar.vercel.sh/runway.png', 'https://runwayml.com', 1),
('d0000000-0000-0000-0000-000000000007', 'Flux.1 Pro', 'flux-pro', 'Ultra-crisp anatomy, flawless typography rendering and photorealistic fidelity.', 'https://avatar.vercel.sh/flux.png', 'https://blackforestlabs.ai', 1),
('d0000000-0000-0000-0000-000000000008', 'Gemini 2.0', 'gemini-2', 'Deep multimodal reasoning, precise structured output, and fast creative iterations.', 'https://avatar.vercel.sh/gemini.png', 'https://deepmind.google/gemini', 0),
('d0000000-0000-0000-0000-000000000009', 'Seedance', 'seedance', 'Dynamic camera motion and fluid character dance choreography.', 'https://avatar.vercel.sh/seedance.png', 'https://seedance.ai', 0),
('d0000000-0000-0000-0000-000000000010', 'Hailuo MiniMax', 'hailuo', 'Hyper-smooth human expressions and camera dolly zooms.', 'https://avatar.vercel.sh/hailuo.png', 'https://hailuoai.com', 0)
ON CONFLICT (slug) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
prompt_count = EXCLUDED.prompt_count;

-- 4. INSERT TAGS
INSERT INTO public.tags (name, slug) VALUES
('automotive', 'automotive'),
('supercar', 'supercar'),
('commercial', 'commercial'),
('cinematic', 'cinematic'),
('skincare', 'skincare'),
('luxury', 'luxury'),
('fashion', 'fashion'),
('editorial', 'editorial'),
('ugc', 'ugc'),
('tiktok', 'tiktok'),
('3d', '3d'),
('minimal', 'minimal'),
('architecture', 'architecture'),
('tokyo', 'tokyo'),
('food', 'food')
ON CONFLICT (slug) DO NOTHING;

-- 5. INSERT PROMPTS (IMAGE PROMPTS)
INSERT INTO public.prompts (id, title, description, prompt, type, category_id, subcategory_id, model_id, style, aspect_ratio, duration, camera, lighting, image_url, video_url, thumbnail_url, status, featured, trending, views_count, copies_count, favorites_count) VALUES
('a0000000-0000-0000-0000-000000000001', 'Luxury Skincare Product Campaign', 'A crisp, high-converting product hero shot for luxury cosmetic brands featuring frosted glass, wet travertine, and diffused sunlight.', 'Commercial macro hero shot of a frosted glass serum bottle sitting on a wet travertine stone pedestal, surrounded by micro water droplets, soft morning sun casting dappled shadows, diffused botanical greenery in the soft background, clean minimalist Nordic aesthetic, 8k resolution, photorealistic.', 'image', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', 'Minimal', '4:5', NULL, 'Macro lens at eye level', 'Diffused morning sunlight with caustics', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 12400, 2420, 890),

('a0000000-0000-0000-0000-000000000002', 'Porsche 911 GT3 Neon Cyber Rain', 'High-end automotive visual blending cyberpunk atmosphere with commercial supercar lighting and water reflections.', 'Ultra-wide angle studio photograph of an obsidian black Porsche 911 GT3 parked on asphalt drenched with reflective puddles, neon magenta and cyan streetlights bleeding into the dark moody atmosphere, hyper-detailed carbon fiber wing, anamorphic lens flare, sharp rim light tracing the car silhouette.', 'image', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000007', 'Cinematic', '16:9', NULL, 'Low ground-level 3/4 front angle', 'Dual-tone magenta and cyan rim light against dark asphalt', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 19800, 3890, 1450),

('a0000000-0000-0000-0000-000000000003', 'Haute Couture Editorial Silk Sculpture', 'High fashion editorial look with flowing silk, organic curves, and classic high-contrast magazine lighting.', 'Vogue editorial fashion portrait of a female model wearing an architectural flowing coral silk gown billowing in wind, sunburst lighting behind the head creating a luminous halo, high fashion pose, fine grain 35mm film texture, muted sand background, sculptural tailoring.', 'image', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'Editorial', '3:4', NULL, 'Medium full shot 85mm Prime f/1.4', 'Golden backlight halo with soft front fill', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', 'published', FALSE, TRUE, 8900, 1780, 640),

('a0000000-0000-0000-0000-000000000004', 'Brutalist Concrete Villa in Nordic Pine Mist', 'Award-winning architectural visualization celebrating raw cast concrete, Nordic landscapes, and inviting warm interior lighting.', 'Architectural photography of a minimalist cantilevered concrete villa embedded in a rocky pine forest, floor-to-ceiling glass reflecting evening fog, warm interior amber glow emitting from the living room, twilight blue hour sky, clean geometric planes, brutalist architecture magazine feature.', 'image', 'c0000000-0000-0000-0000-000000000007', NULL, 'd0000000-0000-0000-0000-000000000004', 'Photorealistic', '16:9', NULL, 'Straight-on architectural two-point perspective', 'Twilight blue hour exterior with warm 2700K interior amber lights', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop', 'published', TRUE, FALSE, 14300, 2950, 1120),

('a0000000-0000-0000-0000-000000000005', 'Deconstructed Michelin Star Gastronomy', 'Stunning fine-dining gastronomy shot with rich textures, edible gold leaf, and Michelin-guide lighting.', 'Editorial culinary shot of a modern deconstructed dessert, dark slate plate with delicate berry gelee, gold leaf accents, edible micro violas, velvety smoked dark chocolate quenelle, dramatic chiaroscuro single softbox lighting, shallow depth of field, food stylist masterwork.', 'image', 'c0000000-0000-0000-0000-000000000005', NULL, 'd0000000-0000-0000-0000-000000000005', 'Luxury', '1:1', NULL, 'Top-down 45-degree angle 100mm Macro', 'Chiaroscuro 45-degree diffused strip box', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop', 'published', FALSE, TRUE, 7400, 1430, 512),

('a0000000-0000-0000-0000-000000000006', 'Iridescent Glassmorphic 3D Spheres', 'Hypnotic 3D glassmorphic spheres with prism reflections and dispersion for modern brand identity assets.', 'Abstract 3D digital render of floating glass spheres with thin-film soap bubble iridescence, refraction caustic patterns dancing across a smooth matte pastel surface, holographic color dispersion, clean studio lighting, Octane render quality, ultra high fidelity.', 'image', 'c0000000-0000-0000-0000-000000000013', NULL, 'd0000000-0000-0000-0000-000000000004', '3D', '16:9', NULL, 'Eye level centered camera 50mm f/1.8', 'Soft overhead studio softbox with rainbow HDR reflection map', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 22100, 4120, 1890),

('a0000000-0000-0000-0000-000000000007', 'Neo-Tokyo Cyberpunk Alleyway Ramen Shop', 'Iconic neo-Tokyo night scene filled with glowing lanterns, neon signage, and steam rising into cold night air.', 'Cinematic wide frame of a cozy glowing ramen stall tucked into a rain-slicked Shinjuku alleyway, steam billowing out from boiling broth pots into the cold night air, vibrant hanging paper lanterns, neon kanji signs reflecting in street puddles, Blade Runner aesthetic, rich atmospheric depth.', 'image', 'c0000000-0000-0000-0000-000000000006', NULL, 'd0000000-0000-0000-0000-000000000007', 'Cinematic', '16:9', NULL, 'Medium wide street-level view 35mm f/1.4', 'Warm orange lanterns contrasted with neon blue and magenta signage', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop', 'published', FALSE, TRUE, 16700, 3340, 1220),

('a0000000-0000-0000-0000-000000000008', 'UGC Honest Skincare Morning Routine Selfie', 'High-performing UGC ad style image capturing genuine influencer authenticity and unvarnished morning routine vibes.', 'Authentic user-generated content iPhone 16 front-facing camera selfie, a 24-year-old glowing woman smiling casually in bathroom mirror holding a dropper bottle of vitamin C serum, natural window light from left, realistic skin texture, unedited raw social media feel, messy morning hair bun, bright modern bathroom.', 'image', 'c0000000-0000-0000-0000-000000000004', NULL, 'd0000000-0000-0000-0000-000000000005', 'Photorealistic', '9:16', NULL, 'iPhone front-facing camera perspective 24mm', 'Natural diffused morning window light', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 14100, 2890, 980),

-- 6. INSERT PROMPTS (VIDEO PROMPTS)
('a0000000-0000-0000-0000-000000000010', 'Luxury Car Cinematic Commercial', 'High-octane automotive commercial with dynamic FPV drone pursuit and seamless transition to wheel tracking.', 'FPV drone shot swooping low over a winding mountain highway in Norway, catching a matte titanium Aston Martin speeding through a cliffside curve, tire spray on wet asphalt, camera seamlessly transitions into a close-up profile tracking shot of the glowing brake calipers, sunset reflections dancing across aerodynamic contours, 8k cinematic realism.', 'video', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cinematic', '16:9', '8s', 'FPV drone swoop into side tracking dolly', 'Golden hour sunset with wet asphalt rim glare', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop', 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-on-a-road-at-sunset-41487-large.mp4', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 24500, 3820, 1650),

('a0000000-0000-0000-0000-000000000011', 'Kinetic Mechanical Optical Lens Assembly', 'Mesmerizing mechanical 3D animation showing precision glass optics assembling in zero gravity.', 'Ultra-slow motion mechanical breakdown of a vintage gold and brass anamorphic camera lens, individual floating optical glass elements aligning in 3D space with microscopic gear teeth turning smoothly, volumetric dust motes caught in golden laser beams, pristine studio lighting.', 'video', 'c0000000-0000-0000-0000-000000000013', NULL, 'd0000000-0000-0000-0000-000000000001', 'Commercial', '16:9', '15s', 'Slow continuous 360 orbit macro camera', 'Prism laser highlights with dark studio background', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 28900, 4210, 1890),

('a0000000-0000-0000-0000-000000000012', 'Cyberpunk Holographic Interface Interactive', 'Sci-fi UI interaction clip showcasing tactile feedback, particle emission, and futuristic hand robotics.', 'First-person perspective of a robotic titanium hand delicately touching a translucent floating holographic UI orb, rings of light pulsate upon touch, data glyphs cascade outward into glowing particles, deep dark space background, cinematic sound stage depth.', 'video', 'c0000000-0000-0000-0000-000000000006', NULL, 'd0000000-0000-0000-0000-000000000002', 'VFX', '16:9', '10s', 'Smooth push-in towards the interactive glowing core', 'High-contrast cyan and amber bioluminescent radiance', 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 18700, 3120, 1340),

('a0000000-0000-0000-0000-000000000013', 'UGC TikTok Skincare Water Splash Reveal', 'High converting UGC ad hook combining relatable TikTok opening with a 960fps commercial liquid explosion.', 'TikTok creator video hook, smiling girl taps camera lens, sudden seamless transition to cinematic macro water splash enveloping a luxury hyaluronic serum bottle, ultra slow motion 960fps, crystal clear liquid droplets suspended mid-air, bright airy pastel studio lighting, viral hook pacing.', 'video', 'c0000000-0000-0000-0000-000000000004', NULL, 'd0000000-0000-0000-0000-000000000002', 'Commercial', '9:16', '8s', 'Handheld smartphone tap zoom into high-speed Phantom macro', 'Bright clean pastel daylight with sparkling water highlights', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop', 'published', TRUE, TRUE, 38000, 5490, 2310),

('a0000000-0000-0000-0000-000000000014', 'Mechanical Switch Press Tactile ASMR', 'Sensory ASMR video prompt showing the internal spring physics of a custom mechanical keyboard switch.', 'Macro high-speed shot of a mechanical keyboard switch being pressed down, transparent casing showing the gold-plated contact leaf and spring compression, keycap snapping down with a cloud of micro dust particles puffing out, crisp tactile feedback, dark studio table.', 'video', 'c0000000-0000-0000-0000-000000000002', NULL, 'd0000000-0000-0000-0000-000000000001', 'Commercial', '16:9', '5s', 'Macro profile slice view', 'Precision rim lighting emphasizing transparency and gold leaf', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop', 'published', FALSE, TRUE, 14200, 2150, 840),

('a0000000-0000-0000-0000-000000000015', 'Volcanic Lava Forge Molten Flow', 'Stunning documentary nature shot of raw magma thermodynamics with real heat distortion ripples.', 'Close-up cinematic shot of bubbling molten lava bursting through dark basalt crust, intense blinding orange heat radiating with atmospheric heat distortion ripples, glowing embers swirling into the night air, deep geological grandeur, IMAX documentary grade.', 'video', 'c0000000-0000-0000-0000-000000000006', NULL, 'd0000000-0000-0000-0000-000000000006', 'Cinematic', '16:9', '10s', 'Slow tracking dolly push-in', 'Bioluminescent 2000K molten glow illuminating smoke', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop', NULL, 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop', 'published', TRUE, FALSE, 21000, 3410, 1450)
ON CONFLICT (id) DO NOTHING;

-- 7. INSERT PROMPT_TAGS ASSOCIATIONS
INSERT INTO public.prompt_tags (prompt_id, tag_id)
SELECT 'a0000000-0000-0000-0000-000000000001'::uuid, id FROM public.tags WHERE slug IN ('skincare', 'luxury', 'commercial')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000002'::uuid, id FROM public.tags WHERE slug IN ('automotive', 'supercar', 'cinematic')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000003'::uuid, id FROM public.tags WHERE slug IN ('fashion', 'editorial')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000004'::uuid, id FROM public.tags WHERE slug IN ('architecture', 'minimal')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000005'::uuid, id FROM public.tags WHERE slug IN ('food', 'luxury')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000006'::uuid, id FROM public.tags WHERE slug IN ('3d', 'minimal')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000007'::uuid, id FROM public.tags WHERE slug IN ('cinematic', 'tokyo')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000008'::uuid, id FROM public.tags WHERE slug IN ('ugc', 'tiktok', 'skincare')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000010'::uuid, id FROM public.tags WHERE slug IN ('automotive', 'cinematic', 'commercial')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000011'::uuid, id FROM public.tags WHERE slug IN ('3d', 'commercial')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000012'::uuid, id FROM public.tags WHERE slug IN ('cinematic')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000013'::uuid, id FROM public.tags WHERE slug IN ('ugc', 'tiktok', 'commercial')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000014'::uuid, id FROM public.tags WHERE slug IN ('commercial')
UNION ALL
SELECT 'a0000000-0000-0000-0000-000000000015'::uuid, id FROM public.tags WHERE slug IN ('cinematic')
ON CONFLICT DO NOTHING;

-- 8. INSERT SAMPLE SUBMISSIONS (FOR ADMIN PANEL REVIEW)
INSERT INTO public.submissions (title, type, description, prompt, category_id, model_id, image_url, status, admin_notes) VALUES
('Futuristic Cybernetic Iris Macro', 'image', 'Extreme close up of human iris with embedded optic fiber circuitry.', 'Extreme macro photograph of human iris with intricate gold cybernetic fiber threads woven into the pupil, bioluminescent cyan pulses, realistic cornea reflection, 8k studio macro.', 'c0000000-0000-0000-0000-000000000006'::uuid, 'd0000000-0000-0000-0000-000000000007'::uuid, 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', 'pending', 'Submitted via community portal'),
('Minimalist Nordic Ceramic Pour Over', 'image', 'Scandi kitchen counter with steam rising from handcrafted matte white dripper.', 'Morning light streaming into a minimalist Copenhagen kitchen, handcrafted speckled ceramic pour-over coffee cone dripping rich espresso into glass carafe, delicate steam ribbons, 35mm film aesthetic.', 'c0000000-0000-0000-0000-000000000002'::uuid, 'd0000000-0000-0000-0000-000000000005'::uuid, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', 'pending', 'Review for commercial product collection'),
('Hypercar Tunnel Acceleration Acoustic Reverberation', 'video', 'High-speed camera following hypercar through echoing alpine tunnel.', 'High-speed tracking shot behind an exotic electric hypercar accelerating through a softly lit European mountain tunnel, aerodynamic wing deploying in slow motion, LED tail light ribbon trailing in darkness.', 'c0000000-0000-0000-0000-000000000001'::uuid, 'd0000000-0000-0000-0000-000000000001'::uuid, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop', 'pending', 'Verify video licensing')
ON CONFLICT DO NOTHING;
