import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { FaqItem } from '@/types';
import { type FaqItemRow, rowToFaqItem } from '@/lib/persistence/faq';

/**
 * Servicio de FAQ — lectura desde BD.
 *
 * Fuente de datos: tabla `business_faq_items`.
 * Si Supabase no está disponible o el negocio no tiene ítems, se devuelve
 * array vacío — la página FAQ degrada mostrando el mensaje de vacío.
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 */

// ─── Lector privado de Supabase ───────────────────────────────────────────────

async function fetchFaqItemsFromDB(businessId: string): Promise<FaqItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('business_faq_items')
    .select('id, business_id, question, answer, category, sort_order, is_active, created_at, updated_at')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('category', { nullsFirst: true })
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[faq.service] Error al leer business_faq_items de Supabase:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as FaqItemRow[]).map(rowToFaqItem);
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve los ítems FAQ activos del negocio, ordenados por categoría y sort_order.
 * Memoizado por React cache (una lectura por request por businessId).
 *
 * @returns FaqItem[] — vacío si no hay ítems o Supabase no está disponible.
 */
export const getFaqItems = cache(
  async (businessId: string): Promise<FaqItem[]> => {
    return fetchFaqItemsFromDB(businessId);
  },
);
