import { cache } from 'react';
import type { FaqItem } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type FaqItemRow, rowToFaqItem } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchFaqItemsFromDB(businessId: string): Promise<FaqItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('faq')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('category', { nullsFirst: true })
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[faq.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as FaqItemRow[]).map(rowToFaqItem);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getFaqItems = cache(fetchFaqItemsFromDB);
