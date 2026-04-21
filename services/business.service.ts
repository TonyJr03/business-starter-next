import { globalConfig } from '@/config';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  type BusinessSettingsRow,
  type BusinessSettings,
  rowToBusinessSettings,
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
  const db = getSupabaseBrowserClient();
  if (!db) return null;

  const targetSlug = slug ?? globalConfig.identity.slug;

  let query = db
    .from('businesses')
    .select(
      'id, slug, name, short_description, whatsapp, phone, email, address, city, country, social, hours',
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
