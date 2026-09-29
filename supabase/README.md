# AICORN — Supabase Unified Backend Setup

AICORN uses **Supabase for EVERYTHING**:
- **Supabase Auth**: Authentication (Email/Password & Google OAuth) with automatic profile creation
- **PostgreSQL Database**: All application metadata, prompts, categories, models, tags, views, copies, favorites, submissions
- **Supabase Storage**: Native hosting for images, videos, thumbnails, and user submissions
- **Row Level Security (RLS)**: Fine-grained security for public visitors, authenticated creators, and administrators

## 1. Quick Setup (1-Click SQL Execution)

1. Open your Supabase Project SQL Editor:
   [https://supabase.com/dashboard/project/njzxalelggtlxaoxxjkk/sql/new](https://supabase.com/dashboard/project/njzxalelggtlxaoxxjkk/sql/new)
2. Open [`full_setup.sql`](./full_setup.sql).
3. Copy and paste the entire script into the SQL editor and click **Run**.

## 2. Supabase Storage Buckets Created
- `prompt-images`: High-resolution prompt image previews (public read, admin write)
- `prompt-videos`: Video preview clips (public read, admin write)
- `prompt-thumbnails`: Compressed media thumbnails (public read, admin write)
- `user-submissions`: Community prompt creator uploads (authenticated write, public/admin read)

## 3. Files in this Directory
- `full_setup.sql`: Complete consolidated schema, triggers, RLS policies, Storage buckets, and seed data.
- `schema.sql`: Table definitions, storage buckets, and RLS policies only.
- `seed.sql`: Initial categories, models, tags, prompts, and submissions.
