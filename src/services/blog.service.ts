import { cache } from 'react';
import type { BlogPost } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type BlogPostRow, rowToBlogPost } from '@/lib/persistence';

const todayFormatter = new Intl.DateTimeFormat('en-US', {
  day:      '2-digit',
  month:    '2-digit',
  year:     'numeric',
  timeZone: 'America/Havana',
});

function getTodayISODate(): string {
  const parts = todayFormatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')!.value;
  const month = parts.find((part) => part.type === 'month')!.value;
  const day = parts.find((part) => part.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPostsFromDB(businessId: string): Promise<BlogPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();
  const today = getTodayISODate();

  const { data, error } = await db
    .from('blog')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_published', true)
    .not('published_at', 'is', null)
    .lte('published_at', today)
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

async function fetchPostBySlugFromDB(businessId: string, slug: string): Promise<BlogPost | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;
  const db = await createSupabaseServerClient();
  const today = getTodayISODate();

  const { data, error } = await db
    .from('blog')
    .select('*')
    .eq('business_id', businessId)
    .eq('slug', slug)
    .eq('is_published', true)
    .not('published_at', 'is', null)
    .lte('published_at', today)
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
