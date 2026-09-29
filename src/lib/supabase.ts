import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njzxalelggtlxaoxxjkk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qenhhbGVsZ2d0bHhhb3h4amtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NDIxOTAsImV4cCI6MjEwNjIxODE5MH0.2rpIi98ePHjvlQUw1IViXKk1OFzKM44hnfeWMIR9MzI';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('mock')
);

/**
 * Creates an authenticated Supabase client with a Clerk JWT token.
 * Used for Supabase Third-Party Auth (TPA) where Supabase validates the Clerk token against Clerk JWKS.
 */
export function createClerkSupabaseClient(clerkToken?: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: clerkToken
      ? {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        }
      : {},
  });
}

/**
 * Universal client-side Supabase client.
 * Uses anon key with full public read access across prompts, categories, models, and skills.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side / Admin Supabase client (using service role key)
// Never embed the service-role key in source or the browser bundle. API routes
// that require administrative access must explicitly check the env variable.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
