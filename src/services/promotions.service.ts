import { cache } from 'react';
import type { Promotion, PromotionStatus } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type PromotionRow, rowToPromotion } from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPromotionsFromDB(businessId: string): Promise<Promotion[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('promotions')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[promotions.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as PromotionRow[]).map(rowToPromotion);
}

// ─── Derived ──────────────────────────────────────────────────────────────────

async function fetchPromotionById(businessId: string, id: string): Promise<Promotion | undefined> {
  const all = await getPromotions(businessId);
  return all.find((p) => p.id === id);
}

async function fetchActivePromotions(businessId: string): Promise<Promotion[]> {
  const all = await getPromotions(businessId);
  return all.filter((p) => getPromotionStatus(p) === 'active');
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getPromotions = cache(fetchPromotionsFromDB);
export const getPromotionById = cache(fetchPromotionById);
export const getActivePromotions = cache(fetchActivePromotions);

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export function getPromotionStatus(promotion: Promotion): PromotionStatus {
  if (promotion.status === 'paused') return 'paused';

  const now = new Date();
  if (promotion.endsAt && new Date(promotion.endsAt) < now) return 'expired';
  if (promotion.startsAt && new Date(promotion.startsAt) > now) return 'upcoming';
  return 'active';
}

export function isPromotionActive(promotion: Promotion): boolean {
  return getPromotionStatus(promotion) === 'active';
}