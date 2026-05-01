import { cache } from 'react';
import type { AboutContent } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type AboutRow, rowToAboutContent } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchAboutContentFromDB(businessId: string): Promise<AboutContent | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('about')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[about.service] Error:', error.message);
    }
    return undefined;
  }

  if (!data) return undefined;

  return rowToAboutContent(data as AboutRow);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getAboutContent = cache(fetchAboutContentFromDB);
