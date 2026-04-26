import type { Promotion, PromotionStatus } from '@/types';
import { promotions as localPromotions } from '@/data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type PromotionRow, rowToPromotion } from '@/lib/persistence/promotion';

/**
 * Servicio de promociones — lectura y resolución de estado.
 *
 * Estrategia de fuente de datos:
 *   1. Supabase (si las env vars están presentes y la consulta tiene éxito)
 *   2. Datos locales como fallback (sin env, fallo de red, BD vacía)
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 */

// ─── Lector privado de Supabase ───────────────────────────────────────────────
// Devuelve null si Supabase no está disponible o la consulta falla,
// lo que activa el fallback a datos locales.

async function fetchPromotionsFromDB(): Promise<Promotion[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('promotions')
    .select('*')
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[promotions.service] Error al leer promociones de Supabase:', error.message);
    }
    return null;
  }

  if (!data || data.length === 0) return null;

  return (data as PromotionRow[]).map(rowToPromotion).filter((x): x is Promotion => x !== null);
}

// ─── Estado ───────────────────────────────────────────────────────────────────

/**
 * Resuelve el estado de ciclo de vida de una promoción en un momento dado.
 *
 * Prioridad de resolución:
 *  1. `promotion.status` explícito en el dato → se usa directamente.
 *  2. Derivado de startsAt / endsAt comparado con `now` (inicio del día).
 *  3. Retrocompat: `isActive === false` → 'paused'; ausente → 'active'.
 *
 * @param promotion - Objeto Promotion tipado.
 * @param now       - Fecha de referencia. Por defecto: Date actual. Útil en tests.
 */
export function getPromotionStatus(
  promotion: Promotion,
  now: Date = new Date(),
): PromotionStatus {
  // 1. Estado explícito en el dato
  if (promotion.status) return promotion.status;

  // 2. Derivar por fechas (normalizar a inicio del día)
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const starts = promotion.startsAt ? new Date(promotion.startsAt) : null;
  const ends   = promotion.endsAt   ? new Date(promotion.endsAt)   : null;

  if (starts && starts > dayStart) return 'upcoming';
  if (ends   && ends   < dayStart) return 'expired';

  // 3. Retrocompat con el campo booleano heredado
  if (promotion.isActive === false) return 'paused';

  return 'active';
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve todas las promociones sin filtrar.
 * Fuente: Supabase → fallback local.
 */
export async function getPromotions(): Promise<Promotion[]> {
  return (await fetchPromotionsFromDB()) ?? localPromotions;
}

/**
 * Devuelve solo las promociones cuyo estado resuelto es 'active'.
 * Fuente: Supabase → fallback local.
 *
 * @param now - Fecha de referencia. Por defecto: Date actual.
 */
export async function getActivePromotions(now: Date = new Date()): Promise<Promotion[]> {
  const all = await getPromotions();
  return all.filter((p) => getPromotionStatus(p, now) === 'active');
}

/**
 * Busca una promoción por su id.
 * Devuelve undefined si no existe.
 * Fuente: Supabase → fallback local.
 */
export async function getPromotionById(id: string): Promise<Promotion | undefined> {
  const all = await getPromotions();
  return all.find((p) => p.id === id);
}

// ─── Helpers de dominio ───────────────────────────────────────────────────────

/**
 * Devuelve true si la promoción está activa en el momento indicado.
 * Equivale a `getPromotionStatus(promotion, now) === 'active'`.
 *
 * Útil como guard rápido sin necesitar el tipo PromotionStatus completo.
 *
 * @param promotion - Objeto Promotion tipado.
 * @param now       - Fecha de referencia. Por defecto: Date actual.
 */
export function isPromotionActive(promotion: Promotion, now: Date = new Date()): boolean {
  return getPromotionStatus(promotion, now) === 'active';
}
