import { cache } from 'react'
import { globalConfig } from '@/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BusinessSettings, BusinessDirectoryItem } from '@/types'
import {
  type BusinessSettingsRow,
  rowToBusinessSettings,
  type BusinessDirectoryRow,
  rowToBusinessDirectoryItem,
} from '@/lib/persistence';

/**
 * Servicio de configuración básica del negocio — lectura desde BD.
 *
 * Estrategia de fuente de datos:
 *   1. Supabase (si las env vars están presentes y la consulta tiene éxito)
 *   2. globalConfig como fallback (sin env, fallo de red, fila vacía)
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 *
 * Campos persistidos: name, shortDescription, whatsapp, phone, email,
 * address, city, country, social, hours.
 * Branding, módulos y navegación permanecen en globalConfig (código, no datos).
 */

// ─── Fallback desde globalConfig ─────────────────────────────────────────────

function settingsFromConfig(): BusinessSettings {
  const { identity, contact, location, social, hours } = globalConfig;
  return {
    id:               '',
    slug:             identity.slug ?? '',
    name:             identity.name,
    shortDescription: identity.shortDescription,
    whatsapp:         contact.whatsapp,
    phone:            contact.phone,
    email:            contact.email,
    address:          contact.address
      ?? (location.street
          ? [location.street, location.municipality].filter(Boolean).join(', ')
          : undefined),
    city:             location.city,
    country:          location.country,
    social:           social,
    hours:            hours,
  };
}

// ─── Lector privado de Supabase ───────────────────────────────────────────────
// Devuelve null si Supabase no está disponible o la consulta falla,
// lo que activa el fallback a globalConfig.

async function fetchBusinessSettingsFromDB(
  slug?: string,
): Promise<BusinessSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  const targetSlug = slug ?? globalConfig.identity.slug;

  let query = db
    .from('businesses')
    .select(
      'id, slug, name, short_description, whatsapp, phone, email, address, city, country, social, hours, branding',
    );

  if (targetSlug) {
    query = query.eq('slug', targetSlug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[business.service] Error al leer business settings de Supabase:',
        error.message,
      );
    }
    return null;
  }

  if (!data) return null;

  return rowToBusinessSettings(data as BusinessSettingsRow);
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve los settings básicos del negocio.
 *
 * Si se pasa `slug`, busca ese negocio concreto (útil en multi-tenant).
 * Si se omite, usa `globalConfig.identity.slug` como clave de búsqueda.
 *
 * Fuente: Supabase → fallback a globalConfig.
 *
 * @param slug - Slug del negocio a consultar (opcional).
 */
export async function getBusinessSettings(slug?: string): Promise<BusinessSettings> {
  return (await fetchBusinessSettingsFromDB(slug)) ?? settingsFromConfig();
}

// ─── Tenant routing ──────────────────────────────────────────────────────────

/**
 * Resuelve un negocio por slug consultando Supabase.
 *
 * Usa `cache()` de React para deduplicar consultas dentro del mismo render pass:
 * varios Server Components en el mismo árbol obtienen la misma promesa.
 *
 * Retorna `null` si el negocio no existe o ante cualquier error.
 * El caller decide si mostrar 404 o continuar.
 */
export const resolveBusinessBySlug = cache(
  async (slug: string): Promise<BusinessSettings | null> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const db = await createSupabaseServerClient();

    const { data, error } = await db
      .from('businesses')
      .select(
        'id, slug, name, short_description, whatsapp, phone, email, address, city, country, social, hours, branding',
      )
      .eq('slug', slug)
      .single<BusinessSettingsRow>()

    if (error || !data) return null;

    return rowToBusinessSettings(data);
  },
)

/**
 * Devuelve todos los negocios activos para el directorio público.
 *
 * - Filtra por `is_active = true`.
 * - Selecciona solo los campos necesarios para una tarjeta de directorio.
 * - Ordenados alfabéticamente por nombre.
 * - Retorna array vacío ante cualquier error.
 */
export async function listActiveBusinesses(): Promise<BusinessDirectoryItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('businesses')
    .select('id, slug, name, short_description, city')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .returns<BusinessDirectoryRow[]>()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[business.service] Error al listar negocios activos:', error.message);
    }
    return [];
  }

  return (data ?? []).map(rowToBusinessDirectoryItem);
}
