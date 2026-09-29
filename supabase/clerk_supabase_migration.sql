-- ====================================================================
-- AICORN CLERK + SUPABASE THIRD-PARTY AUTH (TPA) SCHEMA MIGRATION
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/njzxalelggtlxaoxxjkk/sql/new
-- ====================================================================

-- 1. Remove obsolete Supabase Auth trigger (Auth is managed by Clerk)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Alter PROFILES table to accept Clerk user IDs (e.g. 'user_2xxxxxxxx')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE TEXT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_profiles_user_id'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT unique_profiles_user_id UNIQUE (user_id);
  END IF;
END $$;

-- 3. Alter FAVORITES table for Clerk user IDs
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE public.favorites ALTER COLUMN user_id TYPE TEXT;

-- 4. Alter SUBMISSIONS table for Clerk user IDs
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
ALTER TABLE public.submissions ALTER COLUMN user_id TYPE TEXT;

-- 5. Alter PROMPT_VIEWS table for Clerk user IDs
ALTER TABLE public.prompt_views DROP CONSTRAINT IF EXISTS prompt_views_user_id_fkey;
ALTER TABLE public.prompt_views ALTER COLUMN user_id TYPE TEXT;

-- 6. Alter PROMPT_COPIES table for Clerk user IDs
ALTER TABLE public.prompt_copies DROP CONSTRAINT IF EXISTS prompt_copies_user_id_fkey;
ALTER TABLE public.prompt_copies ALTER COLUMN user_id TYPE TEXT;

-- 7. Alter PROMPTS created_by for Clerk user IDs
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_created_by_fkey;
ALTER TABLE public.prompts ALTER COLUMN created_by TYPE TEXT;

-- 8. Admin check function using Clerk user ID (claims from auth.jwt()->>'sub')
CREATE OR REPLACE FUNCTION public.is_admin(clerk_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF clerk_user_id IS NULL OR clerk_user_id = '' THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE (user_id = clerk_user_id OR id = clerk_user_id) AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update Row Level Security Policies for Clerk JWT Claims (auth.jwt()->>'sub')

-- PROFILES RLS
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (
      (auth.jwt()->>'sub') = user_id OR (auth.jwt()->>'sub') = id OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (
      (auth.jwt()->>'sub') = user_id OR public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role'
    )
    WITH CHECK (
      -- Normal users cannot elevate their own role to admin
      (
        ((auth.jwt()->>'sub') = user_id AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = (auth.jwt()->>'sub')))
        OR public.is_admin(auth.jwt()->>'sub')
        OR auth.role() = 'service_role'
      )
    );

-- FAVORITES RLS
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites"
    ON public.favorites FOR SELECT
    USING ((auth.jwt()->>'sub') = user_id OR public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites"
    ON public.favorites FOR INSERT
    WITH CHECK ((auth.jwt()->>'sub') = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites"
    ON public.favorites FOR DELETE
    USING ((auth.jwt()->>'sub') = user_id OR auth.role() = 'service_role');

-- SUBMISSIONS RLS
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
CREATE POLICY "Users can view their own submissions"
    ON public.submissions FOR SELECT
    USING ((auth.jwt()->>'sub') = user_id OR public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
CREATE POLICY "Users can create submissions"
    ON public.submissions FOR INSERT
    WITH CHECK ((auth.jwt()->>'sub') = user_id OR user_id IS NULL OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;
CREATE POLICY "Admins can update submissions"
    ON public.submissions FOR UPDATE
    USING (public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can delete submissions" ON public.submissions;
CREATE POLICY "Admins can delete submissions"
    ON public.submissions FOR DELETE
    USING (public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

-- PROMPTS RLS (Admin Management)
DROP POLICY IF EXISTS "Admins can insert prompts" ON public.prompts;
CREATE POLICY "Admins can insert prompts" 
    ON public.prompts FOR INSERT 
    WITH CHECK (public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can update prompts" ON public.prompts;
CREATE POLICY "Admins can update prompts" 
    ON public.prompts FOR UPDATE 
    USING (public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can delete prompts" ON public.prompts;
CREATE POLICY "Admins can delete prompts" 
    ON public.prompts FOR DELETE 
    USING (public.is_admin(auth.jwt()->>'sub') OR auth.role() = 'service_role');

-- PROMPT VIEWS & COPIES RLS
DROP POLICY IF EXISTS "Anyone can record views" ON public.prompt_views;
CREATE POLICY "Anyone can record views"
    ON public.prompt_views FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can record copies" ON public.prompt_copies;
CREATE POLICY "Anyone can record copies"
    ON public.prompt_copies FOR INSERT
    WITH CHECK (true);

-- ====================================================================
-- HELPER: ENSURE SUDAPAWAN301 IS DESIGNATED AS ADMIN
-- ====================================================================
UPDATE public.profiles 
SET role = 'admin' 
WHERE name ILIKE '%Pawan%' OR name ILIKE '%suda%' OR role = 'admin';

