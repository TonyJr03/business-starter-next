import { cache } from 'react';
import type { BusinessSettings, BusinessDirectoryItem } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type BusinessSettingsRow, rowToBusinessSettings } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchAllBusinessesFromDB(): Promise<BusinessSettings[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('businesses')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[business.service] Error:', error.message);
    }
    return [];
  }

  return (data ?? []).map((row) => rowToBusinessSettings(row as BusinessSettingsRow));
}

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

// ─── Derived ──────────────────────────────────────────────────────────────────

async function fetchBusinessById(id: string): Promise<BusinessSettings | null> {
  const all = await getAllBusinesses();
  return all.find((b) => b.id === id) ?? null;
}

async function fetchActiveBusinesses(): Promise<BusinessDirectoryItem[]> {
  const all = await getAllBusinesses();
  return all
    .filter((b) => b.isActive)
    .map((b) => ({
      id:               b.id,
      slug:             b.slug,
      name:             b.name,
      shortDescription: b.shortDescription,
      city:             b.location?.city,
    }));
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const resolveBusinessBySlug = cache(fetchBusinessBySlugFromDB);
export const getAllBusinesses       = cache(fetchAllBusinessesFromDB);
export const getBusinessById       = cache(fetchBusinessById);
export const listActiveBusinesses  = cache(fetchActiveBusinesses);
