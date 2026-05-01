import { cache } from 'react';
import type { BlogPost } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type BlogPostRow, rowToBlogPost } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPostsFromDB(businessId: string): Promise<BlogPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('blog')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[blog.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as BlogPostRow[]).map(rowToBlogPost);
}

async function fetchPostBySlugFromDB(
  businessId: string,
  slug: string,
): Promise<BlogPost | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('blog')
    .select('*')
    .eq('business_id', businessId)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[blog.service] Error:', error.message);
    }
    return undefined;
  }

  if (!data) return undefined;

  return rowToBlogPost(data as BlogPostRow);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getPosts = cache(fetchPostsFromDB);
export const getPostBySlug = cache(fetchPostBySlugFromDB);
