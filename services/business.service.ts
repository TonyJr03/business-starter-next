import { cache } from 'react';
import type { BusinessSettings, BusinessDirectoryItem } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type BusinessSettingsRow, rowToBusinessSettings } from '@/lib/persistence';
import { type BusinessDirectoryRow, rowToBusinessDirectoryItem } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchBusinessBySlugFromDB(slug: string): Promise<BusinessSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[business.service] Error:', error.message);
    }
    return null;
  }

  if (!data) return null;

  return rowToBusinessSettings(data as BusinessSettingsRow);
}

async function fetchActiveBusinessesFromDB(): Promise<BusinessDirectoryItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('businesses')
    .select('id, slug, name, short_description, location')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .returns<BusinessDirectoryRow[]>();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[business.service] Error:', error.message);
    }
    return [];
  }

  return (data ?? []).map(rowToBusinessDirectoryItem);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const resolveBusinessBySlug = cache(fetchBusinessBySlugFromDB);
export const listActiveBusinesses = cache(fetchActiveBusinessesFromDB);