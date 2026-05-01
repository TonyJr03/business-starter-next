import { cache } from 'react';
import type { Promotion, PromotionStatus } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type PromotionRow, rowToPromotion } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPromotionsFromDB(): Promise<Promotion[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('promotions')
    .select('*')
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[promotions.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as PromotionRow[]).map(rowToPromotion).filter((x): x is Promotion => x !== null);
}

async function fetchPromotionById(id: string): Promise<Promotion | undefined> {
  const all = await fetchPromotionsFromDB();
  return all.find((p) => p.id === id);
}

async function fetchActivePromotions(now: Date = new Date()): Promise<Promotion[]> {
  const all = await fetchPromotionsFromDB();
  return all.filter((p) => getPromotionStatus(p, now) === 'active');
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getPromotions = cache(fetchPromotionsFromDB);
export const getPromotionById = cache(fetchPromotionById);
export const getActivePromotions = cache(fetchActivePromotions);

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export function getPromotionStatus(
  promotion: Promotion,
  now: Date = new Date(),
): PromotionStatus {
  if (promotion.status) return promotion.status;

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const starts = promotion.startsAt ? new Date(promotion.startsAt) : null;
  const ends   = promotion.endsAt   ? new Date(promotion.endsAt)   : null;

  if (starts && starts > dayStart) return 'upcoming';
  if (ends   && ends   < dayStart) return 'expired';

  if (promotion.isActive === false) return 'paused';

  return 'active';
}

export function isPromotionActive(promotion: Promotion, now: Date = new Date()): boolean {
  return getPromotionStatus(promotion, now) === 'active';
}