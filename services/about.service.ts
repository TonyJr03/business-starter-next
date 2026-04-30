import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AboutContent } from '@/types';
import { type AboutRow, rowToAboutContent } from '@/lib/persistence/about';

/**
 * Servicio de contenido About — lectura desde BD.
 *
 * Fuente de datos: tabla `business_about` (relación 1:1 con businesses).
 * Si Supabase no está disponible o el negocio no tiene fila en la tabla,
 * se devuelve null — la página About degrada elegantemente omitiendo
 * las secciones Historia, Misión y Diferenciadores.
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 */

// ─── Lector privado de Supabase ───────────────────────────────────────────────

async function fetchAboutContentFromDB(businessId: string): Promise<AboutContent | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('business_about')
    .select('id, business_id, story, mission, differentiators, team_image_url, created_at, updated_at')
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[about.service] Error al leer business_about de Supabase:', error.message);
    }
    return null;
  }

  if (!data) return null;

  return rowToAboutContent(data as AboutRow);
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve el contenido editorial de la página About para el negocio indicado.
 * Memoizado por React cache (una lectura por request por businessId).
 *
 * @returns AboutContent o null si el negocio no tiene contenido About en BD.
 */
export const getAboutContent = cache(
  async (businessId: string): Promise<AboutContent | null> => {
    return fetchAboutContentFromDB(businessId);
  },
);
